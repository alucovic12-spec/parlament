import { cache } from 'react'
import { sanityFetch } from '@/lib/sanity/fetch'
import { defaultHomeImages, defaultOfferCategories } from './default-images'

export type HomeSection = 'hero' | 'nextEvent' | 'offer' | 'concept' | 'gallery' | 'careers' | 'visit'

export type HomeImages = {
  hero: string[]
  offer: (string | null)[]
  offerCategories: (string | null)[]
  concept: { main: string | null; accent: string | null }
  gallery: (string | null)[]
  nextEvent: string | null
  hidden: Partial<Record<HomeSection, boolean>>
}

export { defaultHomeImages }

type RawHome = {
  imported?: boolean | null
  hero?: (string | null)[] | null
  offer?: { image?: string | null; category?: string | null }[] | null
  conceptMain?: string | null
  conceptAccent?: string | null
  tiles?: { url?: string | null }[] | null
  nextEvent?: string | null
  hidden?: Partial<Record<HomeSection, boolean | null>> | null
} | null

const query = `*[_id == "homePage"][0]{
  imported,
  "hero": hero.slides[].asset->url,
  "offer": offer.items[]{ "image": image.asset->url, category },
  "conceptMain": concept.mainImage.asset->url,
  "conceptAccent": concept.accentImage.asset->url,
  "tiles": gallery.tiles[]{ "url": image.asset->url },
  "nextEvent": nextEvent.image.asset->url,
  "hidden": {
    "hero": hero.hideSection,
    "nextEvent": nextEvent.hideSection,
    "offer": offer.hideSection,
    "concept": concept.hideSection,
    "gallery": gallery.hideSection,
    "careers": careers.hideSection,
    "visit": visit.hideSection
  }
}`

const sized = (url: string, width: number) => `${url}?w=${width}&auto=format`
const sizedOrNull = (url: string | null | undefined, width: number) => (url ? sized(url, width) : null)

const fallbackImages: HomeImages = {
  hero: defaultHomeImages.hero,
  offer: defaultHomeImages.offer,
  offerCategories: defaultOfferCategories,
  concept: defaultHomeImages.concept,
  gallery: defaultHomeImages.gallery,
  nextEvent: defaultHomeImages.nextEvent,
  hidden: {},
}

/** Replaces each default with the editor's upload at the same position, when there is one. */
function fillSlots(defaults: string[], uploads: (string | null | undefined)[], width: number) {
  return defaults.map((fallback, index) => {
    const url = uploads[index]
    return url ? sized(url, width) : fallback
  })
}

export const getHomeImages = cache(async (): Promise<HomeImages> => {
  const raw = await sanityFetch<RawHome>(query, ['sanity-content'])
  if (!raw) return fallbackImages

  const hidden = Object.fromEntries(
    Object.entries(raw.hidden ?? {}).map(([section, value]) => [section, value === true]),
  ) as HomeImages['hidden']

  if (raw.imported) {
    const items = raw.offer ?? []
    return {
      hero: (raw.hero ?? []).filter((url): url is string => Boolean(url)).map((url) => sized(url, 2000)),
      offer: items.map((item) => sizedOrNull(item.image, 1000)),
      offerCategories: items.map((item) => item.category ?? null),
      concept: { main: sizedOrNull(raw.conceptMain, 1400), accent: sizedOrNull(raw.conceptAccent, 700) },
      gallery: (raw.tiles ?? []).map((tile) => sizedOrNull(tile.url, 1200)),
      nextEvent: sizedOrNull(raw.nextEvent, 1400),
      hidden,
    }
  }

  const heroUploads = (raw.hero ?? []).filter((url): url is string => Boolean(url))

  return {
    hero: heroUploads.length > 0 ? heroUploads.map((url) => sized(url, 2000)) : defaultHomeImages.hero,
    offer: fillSlots(defaultHomeImages.offer, (raw.offer ?? []).map((item) => item.image), 1000),
    offerCategories: defaultOfferCategories,
    concept: {
      main: raw.conceptMain ? sized(raw.conceptMain, 1400) : defaultHomeImages.concept.main,
      accent: raw.conceptAccent ? sized(raw.conceptAccent, 700) : defaultHomeImages.concept.accent,
    },
    gallery: fillSlots(defaultHomeImages.gallery, (raw.tiles ?? []).map((tile) => tile.url), 1200),
    nextEvent: raw.nextEvent ? sized(raw.nextEvent, 1400) : defaultHomeImages.nextEvent,
    hidden,
  }
})
