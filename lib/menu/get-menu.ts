import type { Locale } from '@/lib/i18n/config'
import { menuCategories, menuItems } from './data'
import type { LocalizedMenuCategory, LocalizedMenuItem } from './types'

/**
 * Single data seam for the public menu. Swap the local arrays for a database query here
 * once the admin phase lands; callers keep receiving locale-resolved plain objects.
 */
export function getMenu(locale: Locale): { categories: LocalizedMenuCategory[]; items: LocalizedMenuItem[] } {
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

  const usedCategories = new Set(items.map((item) => item.category))
  const categories = menuCategories
    .filter((category) => usedCategories.has(category.id))
    .map<LocalizedMenuCategory>((category) => ({ id: category.id, name: category.name[locale] }))

  return { categories, items }
}
