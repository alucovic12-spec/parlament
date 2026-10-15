import { NextResponse, type NextRequest } from 'next/server'
import { isLocale, localizedPath, type Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')

  const forwardedHost = request.headers.get('x-forwarded-host')
  const base = forwardedHost
    ? `${request.headers.get('x-forwarded-proto') ?? 'https'}://${forwardedHost}`
    : origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const stored = user?.user_metadata?.locale
      const locale: Locale = typeof stored === 'string' && isLocale(stored) ? stored : 'hr'
      return NextResponse.redirect(`${base}${localizedPath(locale, 'loyalty')}`)
    }
  }

  return NextResponse.redirect(`${base}${localizedPath('hr', 'loyalty')}?auth=failed`)
}
