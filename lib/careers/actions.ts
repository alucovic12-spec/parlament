'use server'

import { createHmac } from 'node:crypto'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { isLocale } from '@/lib/i18n/config'
import { limits } from './config'
import { applicationSchema } from './schema'
import type { ApplicationFieldName, ApplicationState, ApplicationValues } from './types'

const FIELD_NAMES: ApplicationFieldName[] = [
  'fullName',
  'phone',
  'type',
  'startAvailability',
  'motivation',
  'consent',
]

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function hashIp(ip: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'careers'
  return createHmac('sha256', secret).update(ip).digest('hex')
}

export async function submitApplication(
  _previous: ApplicationState,
  formData: FormData,
): Promise<ApplicationState> {
  if (String(formData.get('website') ?? '').length > 0) return { status: 'success' }

  const localeValue = String(formData.get('locale') ?? 'hr')
  const locale = isLocale(localeValue) ? localeValue : 'hr'
  const raw: ApplicationValues = {}
  for (const name of FIELD_NAMES) raw[name] = String(formData.get(name) ?? '')

  const parsed = applicationSchema.safeParse(raw)
  const fieldErrors: Partial<Record<ApplicationFieldName, string>> = {}
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ApplicationFieldName | undefined
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return { status: 'error', fieldErrors, values: raw }
  }

  const input = parsed.data
  const idempotencyKeyRaw = String(formData.get('idempotencyKey') ?? '')
  const idempotencyKey = UUID_PATTERN.test(idempotencyKeyRaw) ? idempotencyKeyRaw : null

  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'unknown'
  const ipHash = hashIp(ip)

  try {
    const supabase = createAdminClient()
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
        .eq('phone', input.phone)
        .gte('created_at', dayAgo),
    ])

    if (byIp.error || byPhone.error) throw byIp.error ?? byPhone.error
    if ((byIp.count ?? 0) >= limits.perIpPerHour || (byPhone.count ?? 0) >= limits.perPhonePerDay) {
      return { status: 'error', fieldErrors: {}, formError: 'rateLimit', values: raw }
    }

    const { error } = await supabase.from('job_applications').insert({
      application_type: input.type,
      full_name: input.fullName,
      phone: input.phone,
      start_availability: input.startAvailability,
      motivation: input.motivation,
      consent: true,
      locale,
      idempotency_key: idempotencyKey,
      ip_hash: ipHash,
    })

    if (error && error.code !== '23505') throw error
  } catch (error) {
    console.error('[careers] submit failed', error)
    return { status: 'error', fieldErrors: {}, formError: 'server', values: raw }
  }

  return { status: 'success' }
}
