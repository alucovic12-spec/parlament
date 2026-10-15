import type { Locale } from '@/lib/i18n/config'

export const galleryCategories = ['interior', 'atmosphere', 'drinks', 'events', 'team', 'guest'] as const

export type GalleryCategory = (typeof galleryCategories)[number]

export type GalleryAspect = 'portrait' | 'square' | 'landscape'

export type GalleryImage = { src: string; width: number; height: number }

/** Source record. Without `image` the tile renders a placeholder until official photography is delivered. */
export type GalleryItem = {
  id: string
  category: GalleryCategory
  aspect: GalleryAspect
  image?: GalleryImage
  alt?: Record<Locale, string>
  caption?: Record<Locale, string>
}

/** Locale-resolved record passed to client components. */
export type GalleryTile = {
  id: string
  category: GalleryCategory
  aspect: GalleryAspect
  image?: GalleryImage
  alt: string
  caption: string
}
