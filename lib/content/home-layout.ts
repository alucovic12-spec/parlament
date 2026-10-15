import { cache } from 'react'
import { linkProjection } from '@/lib/content/link-query'
import type { HeroButtonSource, Localized } from '@/lib/content/site-content'
import { sanityFetch } from '@/lib/sanity/fetch'
import { imageUrl, sizedImage } from '@/lib/sanity/image'

export const homeSectionKeys = ['hero', 'ticker', 'nextEvent', 'offer', 'concept', 'gallery', 'careers', 'visit'] as const
export type HomeSectionKey = (typeof homeSectionKeys)[number]

export type CustomBlock = {
  id: string
  anchor: string | null
  eyebrow: Localized
  title: Localized
  text: Localized
  image: string | null
  imageAlt: string | null
  imagePosition: 'right' | 'left' | 'background' | 'none'
  tone: 'base' | 'dusk' | 'ink' | 'green' | 'sand'
  buttons: HeroButtonSource[]
}

export type HomeEntry = { type: 'section'; key: HomeSectionKey } | { type: 'custom'; block: CustomBlock }

export type RawEntry = {
  _key: string
  _type: string
  eyebrow?: Localized
  title?: Localized
  text?: Localized
  image?: string | null
  imageAlt?: string | null
  imagePosition?: string | null
  tone?: string | null
  anchor?: string | null
  buttons?: HeroButtonSource[] | null
}

const typeToKey = new Map<string, HomeSectionKey>(
  homeSectionKeys.map((key) => [`layout${key.charAt(0).toUpperCase()}${key.slice(1)}`, key]),
)

const positions = ['right', 'left', 'background', 'none'] as const
const tones = ['base', 'dusk', 'ink', 'green', 'sand'] as const

/** Projection shared by the home page layout and by pages made in Studio. */
export const customBlockFields = `
  _key, _type,
  eyebrow{hr, en}, title{hr, en}, text{hr, en},
  "image": ${imageUrl('image')},
  imageAlt, imagePosition, tone,
  "anchor": anchor.current,
  buttons[]{label{hr, en}, style, kind, page, url, newTab, ${linkProjection}}
`

const query = `*[_id == "homePage"][0].layout[isHidden != true]{${customBlockFields}}`

export function toBlock(entry: RawEntry): CustomBlock {
  return {
    id: entry._key,
    anchor: entry.anchor?.trim() || null,
    eyebrow: entry.eyebrow,
    title: entry.title,
    text: entry.text,
    image: entry.image ? sizedImage(entry.image, 1600) : null,
    imageAlt: entry.imageAlt?.trim() || null,
    imagePosition: positions.find((value) => value === entry.imagePosition) ?? 'right',
    tone: tones.find((value) => value === entry.tone) ?? 'base',
    buttons: entry.buttons ?? [],
  }
}

/**
 * Home page entries in the order editors arranged them in Studio: built-in sections (each at most once)
 * and any number of custom sections. A section deleted from the list is not shown. Until the layout has
 * been saved in Studio the original order applies.
 */
export const getHomeLayout = cache(async (): Promise<HomeEntry[]> => {
  const entries = await sanityFetch<RawEntry[] | null>(query, ['sanity-content'])
  if (!entries) return homeSectionKeys.map((key) => ({ type: 'section', key }))

  const seen = new Set<HomeSectionKey>()
  const result: HomeEntry[] = []
  for (const entry of entries) {
    if (entry._type === 'layoutCustom') {
      result.push({ type: 'custom', block: toBlock(entry) })
      continue
    }
    const key = typeToKey.get(entry._type)
    if (key && !seen.has(key)) {
      seen.add(key)
      result.push({ type: 'section', key })
    }
  }
  return result
})
