'use server'

import { createHmac, randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { isLocale } from '@/lib/i18n/config'
import { cvAllowed, cvBucket, cvMaxBytes, limits } from './config'
import { fullApplicationSchema, quickApplicationSchema } from './schema'
import type { ApplicationFieldName, ApplicationState, ApplicationValues } from './types'

const TEXT_FIELDS: ApplicationFieldName[] = [
  'fullName',
  'phone',
  'email',
  'city',
  'type',
  'position',
  'experience',
  'skills',
  'languages',
  'startAvailability',
  'hoursPerWeek',
  'weekends',
  'isStudent',
  'studentContract',
  'expectedPay',
  'motivation',
  'linkedin',
  'consent',
]

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function hashIp(ip: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'careers'
  return createHmac('sha256', secret).update(ip).digest('hex')
}

type CvCheck = { file: File; extension: 'pdf' | 'docx' } | { error: 'cvSize' | 'cvType' } | null

/** Extension, size and file signature must all agree, since the browser-reported MIME type is not trusted. */
async function inspectCv(entry: FormDataEntryValue | null): Promise<CvCheck> {
  if (!(entry instanceof File) || entry.size === 0) return null
  if (entry.size > cvMaxBytes) return { error: 'cvSize' }

  const extension = entry.name.toLowerCase().endsWith('.pdf')
    ? 'pdf'
    : entry.name.toLowerCase().endsWith('.docx')
      ? 'docx'
      : null
  if (!extension) return { error: 'cvType' }

  const head = new Uint8Array(await entry.slice(0, 4).arrayBuffer())
  const isPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46
  const isZip = head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04
  if ((extension === 'pdf' && !isPdf) || (extension === 'docx' && !isZip)) return { error: 'cvType' }

  return { file: entry, extension }
}

export async function submitApplication(
  _previous: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  // Bots tend to fill every field, so a filled honeypot is silently reported as a success.
  if (String(formData.get('website') ?? '').length > 0) return { status: 'success' }

  const mode = String(formData.get('mode') ?? 'full') === 'quick' ? 'quick' : 'full'
  const localeValue = String(formData.get('locale') ?? 'hr')
  const locale = isLocale(localeValue) ? localeValue : 'hr'

  const raw: ApplicationValues = {
    days: formData.getAll('days').map(String),
    shifts: formData.getAll('shifts').map(String),
  }
  for (const name of TEXT_FIELDS) raw[name as Exclude<ApplicationFieldName, 'days' | 'shifts' | 'cv'>] = String(formData.get(name) ?? '')

  const fieldErrors: Partial<Record<ApplicationFieldName, string>> = {}
  const collect = (issues: { path: PropertyKey[]; message: string }[]) => {
    for (const issue of issues) {
      const field = issue.path[0] as ApplicationFieldName | undefined
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
    }
  }

  const parsedQuick = quickApplicationSchema.safeParse(raw)
  const parsedFull = mode === 'full' ? fullApplicationSchema.safeParse(raw) : null
  if (!parsedQuick.success) collect(parsedQuick.error.issues)
  if (parsedFull && !parsedFull.success) collect(parsedFull.error.issues)

  const cv = mode === 'full' ? await inspectCv(formData.get('cv')) : null
  if (cv && 'error' in cv) fieldErrors.cv = cv.error

  if (!parsedQuick.success || (parsedFull && !parsedFull.success) || Object.keys(fieldErrors).length > 0) {
    return { status: 'error', fieldErrors, values: raw }
  }

  const base = parsedQuick.data
  const full = parsedFull?.success ? parsedFull.data : null

  const idempotencyKeyRaw = String(formData.get('idempotencyKey') ?? '')
  const idempotencyKey = UUID_PATTERN.test(idempotencyKeyRaw) ? idempotencyKeyRaw : null

  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown'
  const ipHash = hashIp(ip)

  let uploadedPath: string | null = null
  const supabase = createAdminClient()

  try {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const [byIp, byPhone] = await Promise.all([
      supabase
        .from('job_applications')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', hourAgo),
      supabase
        .from('job_applications')
        .select('id', { count: 'exact', head: true })
        .eq('phone', base.phone)
        .gte('created_at', dayAgo),
    ])
    if (byIp.error || byPhone.error) throw byIp.error ?? byPhone.error

    if ((byIp.count ?? 0) >= limits.perIpPerHour || (byPhone.count ?? 0) >= limits.perPhonePerDay) {
      return { status: 'error', fieldErrors: {}, formError: 'rateLimit', values: raw }
    }

    if (cv && 'file' in cv) {
      const path = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${cv.extension}`
      const upload = await supabase.storage
        .from(cvBucket)
        .upload(path, cv.file, { contentType: cvAllowed[cv.extension], upsert: false })
      if (upload.error) throw upload.error
      uploadedPath = path
    }

    const studentFlag = (value: string | undefined) => (value === 'yes' ? true : value === 'no' ? false : null)
    const isStudent = base.type === 'student' ? true : studentFlag(full?.isStudent)

    const { error } = await supabase.from('job_applications').insert({
      mode,
      application_type: base.type,
      full_name: base.fullName,
      phone: base.phone,
      email: full?.email ?? null,
      city: full?.city ?? null,
      position: full?.position ?? null,
      experience: full?.experience ?? null,
      skills: full && full.skills.length > 0 ? full.skills : null,
      languages: full && full.languages.length > 0 ? full.languages : null,
      start_availability: base.startAvailability,
      available_days: full?.days ?? [],
      available_shifts: full?.shifts ?? [],
      hours_per_week: full?.hoursPerWeek ?? null,
      weekends: full?.weekends ?? null,
      is_student: full ? isStudent : null,
      student_contract: full ? studentFlag(full.studentContract) : null,
      expected_pay: full && full.expectedPay.length > 0 ? full.expectedPay : null,
      motivation: base.motivation,
      linkedin_url: full && full.linkedin.length > 0 ? full.linkedin : null,
      cv_path: uploadedPath,
      consent: true,
      locale,
      idempotency_key: idempotencyKey,
      ip_hash: ipHash,
    })

    if (error) {
      // A duplicate idempotency key means this exact submission is already stored; the new file is an orphan.
      if (error.code === '23505') {
        if (uploadedPath) await supabase.storage.from(cvBucket).remove([uploadedPath])
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('[careers] submit failed', error)
    if (uploadedPath) await supabase.storage.from(cvBucket).remove([uploadedPath]).catch(() => undefined)
    return { status: 'error', fieldErrors: {}, formError: 'server', values: raw }
  }

  return { status: 'success' }
}
