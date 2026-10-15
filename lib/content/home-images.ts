import { cache } from 'react'
import { sanityFetch } from '@/lib/sanity/fetch'

export type HomeImages = {
  hero: string[]
  offer: string[]
  concept: { main: string; accent: string }
  gallery: string[]
  nextEvent: string
}

/** The photos shipped with the site. Used for every slot the editor leaves empty in Studio. */
export const defaultHomeImages: HomeImages = {
  hero: [
    '/images/space/hall-olive-island.png',
    '/images/space/facade-blue-hour.png',
    '/images/space/lounge-central-tree.png',
    '/images/space/hall-oak-tables.png',
    '/images/space/bar-brick-tv.png',
    '/images/space/concept-round-bar.png',
  ],
  offer: [
    '/images/coffee.png',
    '/images/beer-wine.png',
    '/images/wine.png',
    '/images/whisky.png',
    '/images/cocktail.png',
    '/images/small-bites.png',
  ],
  concept: { main: '/images/space/hall-oak-tables.png', accent: '/images/space/velvet-chair.png' },
  gallery: [
    '/images/space/lounge-central-tree.png',
    '/images/space/velvet-chair.png',
    '/images/space/whisky-one-seat.png',
    '/images/space/bar-brick-tv.png',
  ],
  nextEvent: '/images/live-music.png',
}

type RawImages = {
  hero?: (string | null)[] | null
  offer?: (string | null)[] | null
  conceptMain?: string | null
  conceptAccent?: string | null
  gallery?: (string | null)[] | null
  nextEvent?: string | null
} | null

const query = `*[_id == "homePage"][0]{
  "hero": hero.slides[].asset->url,
  "offer": offer.items[].image.asset->url,
  "conceptMain": concept.mainImage.asset->url,
  "conceptAccent": concept.accentImage.asset->url,
  "gallery": gallery.images[].asset->url,
  "nextEvent": nextEvent.image.asset->url
}`

const sized = (url: string, width: number) => `${url}?w=${width}&auto=format`

/** Replaces each default with the editor's upload at the same position, when there is one. */
function fillSlots(defaults: string[], uploads: (string | null)[] | null | undefined, width: number) {
  return defaults.map((fallback, index) => {
    const url = uploads?.[index]
    return url ? sized(url, width) : fallback
  })
}

export const getHomeImages = cache(async (): Promise<HomeImages> => {
  const raw = await sanityFetch<RawImages>(query, ['sanity-content'])
  if (!raw) return defaultHomeImages

  const heroUploads = (raw.hero ?? []).filter((url): url is string => Boolean(url))

  return {
    hero: heroUploads.length > 0 ? heroUploads.map((url) => sized(url, 2000)) : defaultHomeImages.hero,
    offer: fillSlots(defaultHomeImages.offer, raw.offer, 1000),
    concept: {
      main: raw.conceptMain ? sized(raw.conceptMain, 1400) : defaultHomeImages.concept.main,
      accent: raw.conceptAccent ? sized(raw.conceptAccent, 700) : defaultHomeImages.concept.accent,
    },
    gallery: fillSlots(defaultHomeImages.gallery, raw.gallery, 1200),
    nextEvent: raw.nextEvent ? sized(raw.nextEvent, 1400) : defaultHomeImages.nextEvent,
  }
})
