import type { Locale } from '@/lib/i18n/config'

export type Localized = Record<Locale, string>

/** Categories are documents editors create and delete in Studio, so the id is a plain string. */
export type MenuCategoryId = string

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

export type LocalizedMenuCategory = { id: MenuCategoryId; name: string; parentId?: MenuCategoryId; image?: string }

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
