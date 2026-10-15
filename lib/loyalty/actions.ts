'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { z } from 'zod'
import { isLocale, localizedPath } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import { signInSchema, signUpSchema } from './schema'
import type { MemberAuthState, MemberFieldName, MemberFormError } from './types'

function readLocale(formData: FormData) {
  const value = String(formData.get('locale') ?? 'hr')
  return isLocale(value) ? value : 'hr'
}

function collectFieldErrors(error: z.ZodError) {
  const fieldErrors: Partial<Record<MemberFieldName, string>> = {}
  for (const issue of error.issues) {
    const field = issue.path[0] as MemberFieldName | undefined
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
  }
  return fieldErrors
}

async function confirmationRedirectUrl() {
  const configured = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
  if (configured) return configured
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') ?? 'https'
  return `${protocol}://${host}/auth/callback`
}

function classifyAuthError(error: { code?: string; status?: number }): MemberFormError {
  if (error.code === 'email_not_confirmed') return 'unconfirmed'
  if (
    error.code === 'over_request_rate_limit' ||
    error.code === 'over_email_send_rate_limit' ||
    error.status === 429
  ) {
    return 'rateLimit'
  }
  if (error.code === 'invalid_credentials') return 'invalid'
  return 'server'
}

export async function signUpMember(_previous: MemberAuthState, formData: FormData): Promise<MemberAuthState> {
  // Bots tend to fill every field, so a filled honeypot is silently reported as a success.
  if (String(formData.get('website') ?? '').length > 0) {
    return { status: 'check-email', email: String(formData.get('email') ?? '') }
  }

  const locale = readLocale(formData)
  const raw = {
    fullName: String(formData.get('fullName') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    consent: String(formData.get('consent') ?? ''),
  }
  const values = { fullName: raw.fullName, email: raw.email }

  const parsed = signUpSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', fieldErrors: collectFieldErrors(parsed.error), values }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: await confirmationRedirectUrl(),
      data: {
        full_name: parsed.data.fullName,
        loyalty_consent: 'true',
        locale,
      },
    },
  })

  if (error) {
    console.error('[loyalty] sign-up failed', error.code, error.status)
    if (error.code === 'weak_password') {
      return { status: 'error', fieldErrors: { password: 'password' }, values }
    }
    if (error.code === 'email_address_invalid') {
      return { status: 'error', fieldErrors: { email: 'email' }, values }
    }
    return { status: 'error', fieldErrors: {}, formError: classifyAuthError(error), values }
  }

  // With email confirmation off the session exists immediately; otherwise the guest must confirm first.
  if (data.session) redirect(localizedPath(locale, 'loyalty'))

  return { status: 'check-email', email: parsed.data.email }
}

export async function signInMember(_previous: MemberAuthState, formData: FormData): Promise<MemberAuthState> {
  const locale = readLocale(formData)
  const raw = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  }
  const values = { email: raw.email }

  const parsed = signInSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', fieldErrors: collectFieldErrors(parsed.error), values }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    console.error('[loyalty] sign-in failed', error.code, error.status)
    return { status: 'error', fieldErrors: {}, formError: classifyAuthError(error), values }
  }

  redirect(localizedPath(locale, 'loyalty'))
}

export async function signOutMember(formData: FormData) {
  const locale = readLocale(formData)
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(localizedPath(locale, 'loyalty'))
}
