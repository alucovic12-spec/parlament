import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { sanityFetch } from '@/lib/sanity/fetch'
import { galleryItems } from './data'
import { galleryCategories, type GalleryAspect, type GalleryCategory, type GalleryTile } from './types'

type Localized = { hr?: string | null; en?: string | null } | null

type SanityGalleryItem = {
  id: string
  category?: string
  url?: string
  dimensions?: { width: number; height: number } | null
  alt?: Localized
  caption?: Localized
}

const query = `*[_type == "galleryItem" && defined(image.asset)] | order(orderRank asc, _createdAt desc){
  "id": _id,
  category,
  "url": image.asset->url,
  "dimensions": image.asset->metadata.dimensions,
  alt,
  caption
}`

function aspectFor(dimensions: SanityGalleryItem['dimensions']): GalleryAspect {
  if (!dimensions) return 'landscape'
  const ratio = dimensions.width / dimensions.height
  if (ratio > 1.15) return 'landscape'
  if (ratio < 0.87) return 'portrait'
  return 'square'
}

function placeholderTiles(locale: Locale, m: Messages): GalleryTile[] {
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

/** Photos uploaded in Sanity, or the placeholder layout until the first photo is published. */
export async function getGallery(locale: Locale, m: Messages): Promise<GalleryTile[]> {
  const items = await sanityFetch<SanityGalleryItem[]>(query, ['sanity-gallery'])
  if (!items || items.length === 0) return placeholderTiles(locale, m)

  return items.flatMap((item) => {
    if (!item.url) return []
    const category: GalleryCategory = galleryCategories.includes(item.category as GalleryCategory)
      ? (item.category as GalleryCategory)
      : 'atmosphere'
    const categoryLabel = m.galleryPage.categories[category]
    const caption = item.caption?.[locale]?.trim() || item.caption?.hr?.trim() || categoryLabel

    return [
      {
        id: item.id,
        category,
        aspect: aspectFor(item.dimensions),
        image: {
          src: `${item.url}?w=1600&auto=format`,
          width: item.dimensions?.width ?? 1600,
          height: item.dimensions?.height ?? 1067,
        },
        alt: item.alt?.[locale]?.trim() || caption,
        caption,
      },
    ]
  })
}
