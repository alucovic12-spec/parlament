export const locales = ['hr', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'hr'
export const localeCookie = 'NEXT_LOCALE'

export const routeKeys = [
  'menu',
  'events',
  'reservations',
  'gallery',
  'careers',
  'contact',
] as const
export type RouteKey = (typeof routeKeys)[number]
export type PageKey = 'home' | RouteKey

/** Public URL slug per locale. Folder names under app/(site)/[locale] use the RouteKey. */
export const slugs: Record<Locale, Record<RouteKey, string>> = {
  hr: {
    menu: 'meni',
    events: 'program',
    reservations: 'rezervacije',
    gallery: 'galerija',
    careers: 'pridruzi-nam-se',
    contact: 'kontakt',
  },
  en: {
    menu: 'menu',
    events: 'events',
    reservations: 'reservations',
    gallery: 'gallery',
    careers: 'join-our-team',
    contact: 'contact',
  },
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

function isRouteKey(value: string): value is RouteKey {
  return (routeKeys as readonly string[]).includes(value)
}

export function routeKeyFromSlug(locale: Locale, slug: string): RouteKey | null {
  const match = routeKeys.find((key) => slugs[locale][key] === slug)
  return match ?? null
}

/** Croatian lives at the root, every other locale under its own prefix. */
export function localizedPath(locale: Locale, page: PageKey = 'home', rest: string[] = []): string {
  const prefix = locale === defaultLocale ? '' : `/${locale}`
  if (page === 'home') return prefix || '/'
  return [prefix, slugs[locale][page], ...rest].join('/').replace('//', '/')
}

/** Reads a public (or internal rewritten) pathname back into locale, page and trailing segments. */
export function parsePath(pathname: string): { locale: Locale; page: PageKey; rest: string[] } {
  const segments = pathname.split('/').filter(Boolean)
  let locale: Locale = defaultLocale
  if (segments[0] && isLocale(segments[0])) {
    locale = segments[0]
    segments.shift()
  }
  const [first, ...rest] = segments
  if (!first) return { locale, page: 'home', rest: [] }
  const key = routeKeyFromSlug(locale, first) ?? (isRouteKey(first) ? first : null)
  return key ? { locale, page: key, rest } : { locale, page: 'home', rest: [] }
}

export function switchLocalePath(pathname: string, target: Locale): string {
  const { page, rest } = parsePath(pathname)
  return localizedPath(target, page, rest)
}
