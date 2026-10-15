import type { Locale } from '@/lib/i18n/config'

export type Localized = Record<Locale, string>

export const menuCategoryIds = [
  'coffee',
  'hot-drinks',
  'soft-drinks',
  'beer',
  'wine',
  'spirits',
  'whisky',
  'cocktails',
  'food',
  'special',
  'drink-of-the-week',
] as const
export type MenuCategoryId = (typeof menuCategoryIds)[number]

export const menuTags = ['new', 'popular', 'premium', 'nonAlcoholic', 'vegetarian'] as const
export type MenuTag = (typeof menuTags)[number]

/** `hidden` removes the item from the public menu without deleting it. */
export type MenuItemStatus = 'available' | 'unavailable' | 'hidden'

export type MenuCategory = {
  id: MenuCategoryId
  name: Localized
}

export type MenuItem = {
  id: string
  category: MenuCategoryId
  name: Localized
  description?: Localized
  volume?: string
  /** Price in EUR. `null` until the venue confirms the real price. */
  price: number | null
  allergens: string[]
  tags: MenuTag[]
  image?: string
  status: MenuItemStatus
  /** True while the entry is sample content that must be replaced or confirmed. */
  placeholder: boolean
}

export type LocalizedMenuCategory = { id: MenuCategoryId; name: string }

export type LocalizedMenuItem = {
  id: string
  category: MenuCategoryId
  name: string
  description?: string
  volume?: string
  price: number | null
  allergens: string[]
  tags: MenuTag[]
  image?: string
  unavailable: boolean
  placeholder: boolean
}
