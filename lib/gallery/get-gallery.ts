import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { galleryItems } from './data'
import type { GalleryTile } from './types'

/** Single read path for the gallery, so the data source can move to the database without touching the UI. */
export async function getGallery(locale: Locale, m: Messages): Promise<GalleryTile[]> {
  return galleryItems.map((item) => {
    const categoryLabel = m.galleryPage.categories[item.category]
    return {
      id: item.id,
      category: item.category,
      aspect: item.aspect,
      image: item.image,
      alt: item.alt?.[locale] ?? `${m.placeholder.photo}: ${categoryLabel}`,
      caption: item.caption?.[locale] ?? categoryLabel,
    }
  })
}
