'use server'

import { createHmac } from 'node:crypto'
import { headers } from 'next/headers'
import { isLocale } from '@/lib/i18n/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { limits, maxDaysAhead, minLeadMinutes, reservationTimeZone } from './config'
import { reservationSchema } from './schema'
import type { ReservationFieldName, ReservationState, ReservationValues } from './types'

const FIELD_NAMES: ReservationFieldName[] = [
  'fullName',
  'phone',
  'email',
  'date',
  'time',
  'partySize',
  'occasion',
  'notes',
  'consent',
]

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function zagrebNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: reservationTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00'
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function isRealDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === isoDate
}

function hashIp(ip: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'reservations'
  return createHmac('sha256', secret).update(ip).digest('hex')
}

export async function submitReservation(
  _previous: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  // Bots tend to fill every field, so a filled honeypot is silently reported as a success.
  if (String(formData.get('website') ?? '').length > 0) {
    return { status: 'success', summary: { date: '', time: '', partySize: 0 } }
  }

  const raw: ReservationValues = {}
  for (const name of FIELD_NAMES) raw[name] = String(formData.get(name) ?? '')

  const localeValue = String(formData.get('locale') ?? 'hr')
  const locale = isLocale(localeValue) ? localeValue : 'hr'

  const parsed = reservationSchema.safeParse(raw)
  const fieldErrors: Partial<Record<ReservationFieldName, string>> = {}

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ReservationFieldName | undefined
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
    }
  } else {
    const { date, time } = parsed.data
    const now = zagrebNow()
    if (!isRealDate(date)) {
      fieldErrors.date = 'date'
    } else if (date < now.date) {
      fieldErrors.date = 'past'
    } else if (date > addDays(now.date, maxDaysAhead)) {
      fieldErrors.date = 'tooFar'
    } else if (date === now.date) {
      const [hour, minute] = time.split(':').map(Number)
      if (hour * 60 + minute < now.minutes + minLeadMinutes) fieldErrors.time = 'tooSoon'
    }
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    // Free text fields are returned so the guest does not have to retype them.
    return { status: 'error', fieldErrors, values: { ...raw, consent: raw.consent } }
  }

  const input = parsed.data
  const idempotencyKeyRaw = String(formData.get('idempotencyKey') ?? '')
  const idempotencyKey = UUID_PATTERN.test(idempotencyKeyRaw) ? idempotencyKeyRaw : null

  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown'
  const ipHash = hashIp(ip)

  try {
    const supabase = createAdminClient()
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const [byIp, byEmail] = await Promise.all([
      supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', hourAgo),
      supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('email', input.email)
        .gte('created_at', dayAgo),
    ])

    if (byIp.error || byEmail.error) throw byIp.error ?? byEmail.error

    if ((byIp.count ?? 0) >= limits.perIpPerHour || (byEmail.count ?? 0) >= limits.perEmailPerDay) {
      return { status: 'error', fieldErrors: {}, formError: 'rateLimit', values: raw }
    }

    const { error } = await supabase.from('reservations').insert({
      full_name: input.fullName,
      phone: input.phone,
      email: input.email,
      reservation_date: input.date,
      reservation_time: input.time,
      party_size: input.partySize,
      occasion: input.occasion,
      notes: input.notes.length > 0 ? input.notes : null,
      consent: true,
      locale,
      idempotency_key: idempotencyKey,
      ip_hash: ipHash,
    })

    // A duplicate idempotency key means this exact submission was already stored.
    if (error && error.code !== '23505') throw error
  } catch (error) {
    console.error('[reservations] insert failed', error)
    return { status: 'error', fieldErrors: {}, formError: 'server', values: raw }
  }

  return {
    status: 'success',
    summary: { date: input.date, time: input.time, partySize: input.partySize },
  }
}
