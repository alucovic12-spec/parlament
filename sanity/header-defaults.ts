import { en } from '../lib/i18n/messages/en'
import { hr } from '../lib/i18n/messages/hr'

type NavPage = 'home' | 'menu' | 'events' | 'reservations' | 'gallery' | 'careers' | 'contact'

const localized = (page: NavPage) => ({ _type: 'localizedString', hr: hr.nav[page], en: en.nav[page] })

/** The menu the site shows today: home and reservations only live in the mobile bar, because desktop has the reservation button. */
const defaultNav: [NavPage, 'all' | 'mobile'][] = [
  ['home', 'mobile'],
  ['menu', 'all'],
  ['events', 'all'],
  ['reservations', 'mobile'],
  ['gallery', 'all'],
  ['careers', 'all'],
  ['contact', 'all'],
]

/** Starting values so the editor opens with exactly the header that is live today. */
export function siteHeaderDefaults() {
  return {
    nav: defaultNav.map(([page, visibility]) => ({
      _key: `nav-${page}`,
      _type: 'navLink',
      label: localized(page),
      kind: 'page',
      page,
      visibility,
      newTab: false,
      hidden: false,
    })),
    cta: { hide: false, label: localized('reservations'), kind: 'page', page: 'reservations', newTab: false },
    announcement: { show: false },
    showLanguageSwitcher: true,
    stickyHeader: true,
  }
}
