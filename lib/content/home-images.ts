import { cache } from 'react'
import { sanityFetch } from '@/lib/sanity/fetch'
import { imageUrl, sizedImage } from '@/lib/sanity/image'
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
  hero?: { url?: string | null }[] | null
  offer?: { image?: string | null; category?: string | null }[] | null
  conceptMain?: string | null
  conceptAccent?: string | null
  tiles?: { url?: string | null }[] | null
  nextEvent?: string | null
  hidden?: Partial<Record<HomeSection, boolean | null>> | null
} | null

const query = `*[_id == "homePage"][0]{
  imported,
  "hero": hero.slides[]{ "url": ${imageUrl('@')} },
  "offer": offer.items[]{ "image": ${imageUrl('image')}, category },
  "conceptMain": ${imageUrl('concept.mainImage')},
  "conceptAccent": ${imageUrl('concept.accentImage')},
  "tiles": gallery.tiles[]{ "url": ${imageUrl('image')} },
  "nextEvent": ${imageUrl('nextEvent.image')},
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

const sized = sizedImage
const heroUrls = (raw: RawHome) =>
  (raw?.hero ?? []).map((slide) => slide.url).filter((url): url is string => Boolean(url))
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
      hero: heroUrls(raw).map((url) => sized(url, 2000)),
      offer: items.map((item) => sizedOrNull(item.image, 1000)),
      offerCategories: items.map((item) => item.category ?? null),
      concept: { main: sizedOrNull(raw.conceptMain, 1400), accent: sizedOrNull(raw.conceptAccent, 700) },
      gallery: (raw.tiles ?? []).map((tile) => sizedOrNull(tile.url, 1200)),
      nextEvent: sizedOrNull(raw.nextEvent, 1400),
      hidden,
    }
  }

  const heroUploads = heroUrls(raw)

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
