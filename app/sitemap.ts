import type { MetadataRoute } from 'next'
import { getEventIds } from '@/lib/events/get-events'
import { localizedPath, locales, routeKeys, type PageKey } from '@/lib/i18n/config'
import { absoluteUrl } from '@/lib/seo'

const priorities: Record<PageKey, number> = {
  home: 1,
  menu: 0.9,
  events: 0.9,
  reservations: 0.8,
  gallery: 0.6,
  careers: 0.5,
  contact: 0.7,
}

function entry(
  page: PageKey,
  rest: string[],
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [l, absoluteUrl(localizedPath(l, page, rest))]))
  return locales.map((locale) => ({
    url: absoluteUrl(localizedPath(locale, page, rest)),
    changeFrequency,
    priority,
    alternates: { languages },
  }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = (['home', ...routeKeys] as PageKey[]).flatMap((page) =>
    entry(page, [], page === 'events' || page === 'home' ? 'daily' : 'weekly', priorities[page]),
  )
  const events = getEventIds().flatMap((id) => entry('events', [id], 'weekly', 0.5))
  return [...pages, ...events]
}
