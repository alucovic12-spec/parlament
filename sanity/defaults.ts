import { en } from '../lib/i18n/messages/en'
import { hr } from '../lib/i18n/messages/hr'

type Localized = { hr: string; en: string }

const both = (hrValue: string, enValue: string): Localized => ({ hr: hrValue, en: enValue })

const keyed = <T extends object>(items: T[]) => items.map((item, index) => ({ _key: `item-${index}`, ...item }))

export const homeSections = [
  { key: 'hero', title: 'Naslovni dio' },
  { key: 'ticker', title: 'Traka s porukama' },
  { key: 'nextEvent', title: 'Sljedeća sjednica' },
  { key: 'offer', title: 'Ponuda' },
  { key: 'concept', title: 'Koncept' },
  { key: 'gallery', title: 'Isječak arhive' },
  { key: 'careers', title: 'Poziv za posao' },
  { key: 'visit', title: 'Posjet' },
] as const

export const layoutTypeName = (key: string) => `layout${key.charAt(0).toUpperCase()}${key.slice(1)}`

/** The order sections have on the live page today; editors can drag, hide or delete them. */
export const defaultLayout = () =>
  homeSections.map(({ key }) => ({ _key: key, _type: layoutTypeName(key), isHidden: false }))

/** Starting values for the home page document, so the editor opens with the copy that is live today. */
export function homePageDefaults() {
  const h = hr.home
  const e = en.home

  return {
    layout: defaultLayout(),
    meta: {
      title: both(hr.meta.defaultTitle, en.meta.defaultTitle),
      description: both(hr.meta.defaultDescription, en.meta.defaultDescription),
    },
    hero: {
      eyebrow: both(h.hero.eyebrow, e.hero.eyebrow),
      title: both(h.hero.title, e.hero.title),
      text: both(h.hero.text, e.hero.text),
    },
    ticker: keyed(h.ticker.map((line, index) => both(line, e.ticker[index] ?? line))),
    nextEvent: {
      eyebrow: both(h.nextEvent.eyebrow, e.nextEvent.eyebrow),
      title: both(h.nextEvent.title, e.nextEvent.title),
      text: both(h.nextEvent.text, e.nextEvent.text),
    },
    offer: {
      eyebrow: both(h.offer.eyebrow, e.offer.eyebrow),
      title: both(h.offer.title, e.offer.title),
      intro: both(h.offer.intro, e.offer.intro),
      items: keyed(
        h.offer.items.map((item, index) => ({
          title: both(item.title, e.offer.items[index]?.title ?? item.title),
          text: both(item.text, e.offer.items[index]?.text ?? item.text),
        })),
      ),
    },
    concept: {
      eyebrow: both(h.concept.eyebrow, e.concept.eyebrow),
      title: both(h.concept.title, e.concept.title),
      text: both(h.concept.text, e.concept.text),
      materials: keyed(h.concept.materials.map((line, index) => both(line, e.concept.materials[index] ?? line))),
    },
    gallery: { title: both(h.gallery.title, e.gallery.title) },
    careers: {
      title: both(h.careers.title, e.careers.title),
      text: both(h.careers.text, e.careers.text),
    },
    visit: { title: both(h.visit.title, e.visit.title) },
  }
}

export const pageRoutes = [
  { route: 'menu', title: 'Meni' },
  { route: 'events', title: 'Večernje sjednice' },
  { route: 'reservations', title: 'Rezervacije' },
  { route: 'gallery', title: 'Arhiva' },
  { route: 'careers', title: 'Pridruži nam se' },
  { route: 'contact', title: 'Kontakt (Završna riječ)' },
] as const

export type PageRoute = (typeof pageRoutes)[number]['route']

const introFor = (route: PageRoute): Localized | undefined => {
  switch (route) {
    case 'menu':
      return both(hr.menu.intro, en.menu.intro)
    case 'events':
      return both(hr.events.intro, en.events.intro)
    case 'reservations':
      return both(hr.reservations.intro, en.reservations.intro)
    case 'gallery':
      return both(hr.galleryPage.intro, en.galleryPage.intro)
    case 'careers':
      return both(hr.careersPage.subtitle, en.careersPage.subtitle)
    default:
      return undefined
  }
}

export function pageDefaults(route: PageRoute) {
  const intro = introFor(route)
  return {
    title: both(hr.pages[route].title, en.pages[route].title),
    description: both(hr.pages[route].description, en.pages[route].description),
    ...(intro ? { intro } : {}),
  }
}
