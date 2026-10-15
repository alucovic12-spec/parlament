import { cache } from 'react'
import { customBlockFields, toBlock, type CustomBlock, type RawEntry } from '@/lib/content/home-layout'
import type { Localized } from '@/lib/content/site-content'
import { sanityFetch } from '@/lib/sanity/fetch'

export type CustomPage = {
  slug: string
  title: Localized
  description: Localized
  intro: Localized
  blocks: CustomBlock[]
}

type RawPage = {
  title?: Localized
  description?: Localized
  intro?: Localized
  sections?: RawEntry[] | null
}

const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const getCustomPage = cache(async (slug: string): Promise<CustomPage | null> => {
  // The slug is interpolated into GROQ, so only the exact shape Studio allows gets through.
  if (!validSlug.test(slug)) return null
  const page = await sanityFetch<RawPage | null>(
    `*[_type == "customPage" && slug.current == "${slug}"][0]{
      title, description, intro,
      sections[isHidden != true]{${customBlockFields}}
    }`,
    ['sanity-content'],
  )
  if (!page) return null
  return {
    slug,
    title: page.title,
    description: page.description,
    intro: page.intro,
    blocks: (page.sections ?? []).map(toBlock),
  }
})

export async function getCustomPageSlugs(): Promise<string[]> {
  const slugs = await sanityFetch<string[]>(`*[_type == "customPage" && defined(slug.current)].slug.current`, ['sanity-content'])
  return (slugs ?? []).filter((slug) => validSlug.test(slug))
}
