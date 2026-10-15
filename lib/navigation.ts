import { localizedPath, type Locale, type PageKey } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'

export type NavItem = {
  id: string
  key: PageKey | 'external'
  label: string
  href: string
  external?: boolean
  newTab?: boolean
}

export type HeaderLogo = { url: string; width: number; height: number; alt: string; heightPx: number }

const order: PageKey[] = [
  'home',
  'menu',
  'events',
  'reservations',
  'gallery',
  'careers',
  'contact',
]

/** Items shown in the bottom bar on mobile; everything else goes under "More". */
const mobilePrimary: PageKey[] = ['home', 'menu', 'events', 'reservations']

export function getNavItems(locale: Locale, m: Messages): NavItem[] {
  return order.map((key) => ({ id: key, key, label: m.nav[key], href: localizedPath(locale, key) }))
}

export function splitMobileNav(items: NavItem[]) {
  return {
    primary: items.filter((i) => i.key !== 'external' && mobilePrimary.includes(i.key)),
    more: items.filter((i) => i.key === 'external' || !mobilePrimary.includes(i.key)),
  }
}

export const linkAttrs = (item: { newTab?: boolean }) =>
  item.newTab ? ({ target: '_blank', rel: 'noopener noreferrer' } as const) : {}
