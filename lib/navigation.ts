import { localizedPath, type Locale, type PageKey } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'

export type NavItem = { key: PageKey; label: string; href: string }

const order: PageKey[] = [
  'home',
  'menu',
  'events',
  'reservations',
  'tickets',
  'loyalty',
  'gallery',
  'careers',
  'contact',
]

/** Items shown in the bottom bar on mobile; everything else goes under "More". */
const mobilePrimary: PageKey[] = ['home', 'menu', 'events', 'reservations']

export function getNavItems(locale: Locale, m: Messages): NavItem[] {
  return order.map((key) => ({ key, label: m.nav[key], href: localizedPath(locale, key) }))
}

export function splitMobileNav(items: NavItem[]) {
  return {
    primary: items.filter((i) => mobilePrimary.includes(i.key)),
    more: items.filter((i) => !mobilePrimary.includes(i.key)),
  }
}
