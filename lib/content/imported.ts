import { cache } from 'react'
import { sanityFetch } from '@/lib/sanity/fetch'

/**
 * True once the existing site content has been imported into Studio. From then on Sanity is the
 * only source: an empty field, photo or list means "removed", not "use the built-in default".
 */
export const isContentImported = cache(
  async () => (await sanityFetch<boolean | null>('*[_id == "homePage"][0].imported', ['sanity-content'])) === true,
)
