import { NextResponse, type NextRequest } from 'next/server'
import { isLocale, localeCookie, routeKeyFromSlug, type Locale } from '@/lib/i18n/config'

/**
 * Maps public URLs to the internal /[locale]/<routeKey> folders:
 *   /meni             -> /hr/menu
 *   /en/join-our-team -> /en/careers
 * Croatian has no prefix; English lives under /en.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)

  const locale: Locale = segments[0] === 'en' ? 'en' : 'hr'
  const rest = segments[0] === 'en' ? segments.slice(1) : segments

  const rewriteTo = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    return NextResponse.rewrite(url)
  }

  if (rest.length === 0) {
    const saved = request.cookies.get(localeCookie)?.value
    if (locale === 'hr' && saved && isLocale(saved) && saved === 'en') {
      const url = request.nextUrl.clone()
      url.pathname = '/en'
      return NextResponse.redirect(url)
    }
    return rewriteTo(`/${locale}`)
  }

  const [first, ...tail] = rest
  if (first === 'brand' && tail.length === 0) return rewriteTo(`/${locale}/brand`)

  const key = routeKeyFromSlug(locale, first)
  if (!key) return rewriteTo(`/${locale}/not-found`)

  return rewriteTo(`/${[locale, key, ...tail].join('/')}`)
}

export const config = {
  matcher: ['/((?!_next|api|admin|auth|.*\\..*).*)'],
}
