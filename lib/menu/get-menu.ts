import type { Locale } from '@/lib/i18n/config'
import { imageUrl, sizedImage } from '@/lib/sanity/image'
import { sanityFetch } from '@/lib/sanity/fetch'
import { menuCategories, menuItems } from './data'
import type { LocalizedMenuCategory, LocalizedMenuItem, MenuTag } from './types'

type Localized = { hr?: string | null; en?: string | null } | null | undefined

type SanityMenu = {
  categories: { id: string; name?: Localized; parentId?: string | null; image?: string | null }[]
  items: {
    id: string
    category?: string | null
    name?: Localized
    description?: Localized
    volume?: string | null
    price?: number | null
    allergens?: string[] | null
    tags?: string[] | null
    status?: string | null
    placeholder?: boolean | null
    image?: string | null
  }[]
}

const uncategorizedId = 'uncategorized'

const query = `{
  "categories": *[_type == "menuCategory"] | order(orderRank asc, _createdAt asc){
    "id": _id, name, "parentId": parent._ref,
    "image": ${imageUrl('image')}
  },
  "items": *[_type == "menuItem" && status != "hidden"] | order(orderRank asc, _createdAt asc){
    "id": _id,
    "category": categoryRef._ref,
    name, description, volume, price, allergens, tags, status, placeholder,
    "image": ${imageUrl('image')}
  }
}`

const pick = (value: Localized, locale: Locale) => value?.[locale]?.trim() || value?.hr?.trim() || value?.en?.trim() || ''

function localMenu(locale: Locale) {
  const items = menuItems
    .filter((item) => item.status !== 'hidden')
    .map<LocalizedMenuItem>((item) => ({
      id: item.id,
      category: item.category,
      name: item.name[locale],
      description: item.description?.[locale],
      volume: item.volume,
      price: item.price,
      allergens: item.allergens,
      tags: item.tags,
      image: item.image,
      unavailable: item.status === 'unavailable',
      placeholder: item.placeholder,
    }))

  const used = new Set(items.map((item) => item.category))
  const categories = menuCategories
    .filter((category) => used.has(category.id))
    .map<LocalizedMenuCategory>((category) => ({ id: category.id, name: category.name[locale] }))

  return { categories, items }
}

/**
 * The public menu. Studio is the source as soon as it holds at least one category; until then the
 * built-in sample menu keeps the page filled. Categories come ordered, parents followed by their children.
 */
export async function getMenu(locale: Locale): Promise<{ categories: LocalizedMenuCategory[]; items: LocalizedMenuItem[] }> {
  const data = await sanityFetch<SanityMenu>(query, ['sanity-menu'])
  if (!data || data.categories.length === 0) return localMenu(locale)

  const known = new Set(data.categories.map((category) => category.id))
  const items = data.items.map<LocalizedMenuItem>((item) => ({
    id: item.id,
    category: item.category && known.has(item.category) ? item.category : uncategorizedId,
    name: pick(item.name, locale),
    description: pick(item.description, locale) || undefined,
    volume: item.volume?.trim() || undefined,
    price: typeof item.price === 'number' ? item.price : null,
    allergens: item.allergens ?? [],
    tags: (item.tags ?? []) as MenuTag[],
    image: item.image ? sizedImage(item.image, 400) : undefined,
    unavailable: item.status === 'unavailable',
    placeholder: item.placeholder === true,
  }))

  const parentOf = new Map(data.categories.map((category) => [category.id, category.parentId && known.has(category.parentId) ? category.parentId : undefined]))
  const hasItems = new Set<string>()
  for (const item of items) {
    hasItems.add(item.category)
    const parent = parentOf.get(item.category)
    if (parent) hasItems.add(parent)
  }

  const resolved = data.categories
    .filter((category) => hasItems.has(category.id))
    .map<LocalizedMenuCategory>((category) => ({
      id: category.id,
      name: pick(category.name, locale),
      parentId: parentOf.get(category.id),
      image: category.image ? sizedImage(category.image, 1000) : undefined,
    }))

  const tops = resolved.filter((category) => !category.parentId)
  const ordered = tops.flatMap((top) => [top, ...resolved.filter((category) => category.parentId === top.id)])
  const orphans = resolved.filter((category) => category.parentId && !tops.some((top) => top.id === category.parentId))
  const categories = [...ordered, ...orphans]

  if (items.some((item) => item.category === uncategorizedId)) {
    categories.push({ id: uncategorizedId, name: locale === 'hr' ? 'Ostalo' : 'Other' })
  }

  return { categories, items }
}
