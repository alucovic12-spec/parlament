import { cache } from 'react'
import { sanityFetch } from '@/lib/sanity/fetch'

export const homeSectionKeys = ['hero', 'ticker', 'nextEvent', 'offer', 'concept', 'gallery', 'careers', 'visit'] as const
export type HomeSectionKey = (typeof homeSectionKeys)[number]

const typeToKey = new Map<string, HomeSectionKey>(
  homeSectionKeys.map((key) => [`layout${key.charAt(0).toUpperCase()}${key.slice(1)}`, key]),
)

const query = `*[_id == "homePage"][0].layout[isHidden != true]._type`

/**
 * Sections of the home page in the order editors arranged them in Studio. A section deleted from the
 * list is not shown. Until the layout has been saved in Studio the original order applies.
 */
export const getHomeLayout = cache(async (): Promise<HomeSectionKey[]> => {
  const types = await sanityFetch<string[] | null>(query, ['sanity-content'])
  if (!types) return [...homeSectionKeys]

  const seen = new Set<HomeSectionKey>()
  for (const type of types) {
    const key = typeToKey.get(type)
    if (key) seen.add(key)
  }
  return [...seen]
})
