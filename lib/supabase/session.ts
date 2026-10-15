import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'

/**
 * Refreshes an expiring Supabase session and copies the new cookies onto the response.
 * `buildResponse` is called again whenever cookies change so the request and response stay in sync.
 */
export async function refreshSession(request: NextRequest, buildResponse: () => NextResponse) {
  let response = buildResponse()

  // Visitors without a Supabase cookie have no session to refresh, so skip the network call.
  const hasSession = request.cookies.getAll().some((cookie) => cookie.name.startsWith('sb-'))
  if (!hasSession) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { secure: process.env.NODE_ENV === 'production' },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = buildResponse()
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  await supabase.auth.getUser()
  return response
}
