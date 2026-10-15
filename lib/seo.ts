import type { Metadata } from 'next'
import { localizedPath, locales, type Locale, type PageKey } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { getSiteUrl, site } from '@/lib/site'

export const defaultOgImage = {
  url: '/og/parlament-og.jpg',
  width: 1200,
  height: 630,
  alt: `${site.shortName} — People’s Bar`,
}

export function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString()
}

export function alternateLanguages(page: PageKey, rest: string[] = []): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, localizedPath(l, page, rest)]),
  )
  languages['x-default'] = localizedPath('hr', page, rest)
  return languages
}

export function buildMetadata(locale: Locale, page: PageKey = 'home'): Metadata {
  const m = getMessages(locale)
  const isHome = page === 'home'
  const title = isHome ? m.meta.defaultTitle : m.pages[page].title
  const description = isHome ? m.meta.defaultDescription : m.pages[page].description
  const canonical = localizedPath(locale, page)

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: { canonical, languages: alternateLanguages(page) },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: isHome ? title : `${title} | ${site.shortName}`,
      description,
      url: canonical,
      locale: m.meta.ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => getMessages(l).meta.ogLocale),
      images: [defaultOgImage],
    },
    twitter: { card: 'summary_large_image', title, description, images: [defaultOgImage.url] },
  }
}

type JsonLdNode = Record<string, unknown>

/** Site-wide entities: the venue itself and the website. Only confirmed contact data is emitted. */
export function siteJsonLd(locale: Locale): JsonLdNode[] {
  const m = getMessages(locale)
  const url = getSiteUrl()
  const sameAs = Object.values(site.social).filter((value): value is string => Boolean(value))

  const venue: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    '@id': `${url}/#venue`,
    name: site.name,
    alternateName: site.shortName,
    description: m.meta.defaultDescription,
    url,
    image: absoluteUrl(defaultOgImage.url),
    inLanguage: locale,
    hasMenu: absoluteUrl(localizedPath(locale, 'menu')),
    acceptsReservations: absoluteUrl(localizedPath(locale, 'reservations')),
    ...(site.contact.email ? { email: site.contact.email } : {}),
    ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
    ...(site.contact.address
      ? { address: { '@type': 'PostalAddress', streetAddress: site.contact.address, addressCountry: 'HR' } }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }

  const website: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${url}/#website`,
    name: site.name,
    url,
    inLanguage: locale,
    publisher: { '@id': `${url}/#venue` },
  }

  return [venue, website]
}

export function breadcrumbJsonLd(
  locale: Locale,
  page: Exclude<PageKey, 'home'>,
  extra?: { name: string; rest: string[] },
): JsonLdNode {
  const m = getMessages(locale)
  const trail = [
    { name: m.nav.home, path: localizedPath(locale, 'home') },
    { name: m.pages[page].title, path: localizedPath(locale, page) },
    ...(extra ? [{ name: extra.name, path: localizedPath(locale, page, extra.rest) }] : []),
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
