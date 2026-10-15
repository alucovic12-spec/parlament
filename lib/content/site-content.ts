import { cache } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { getMessages, type Messages } from '@/lib/i18n/messages'
import { sanityFetch } from '@/lib/sanity/fetch'
import { site } from '@/lib/site'

type Localized = { hr?: string | null; en?: string | null } | null | undefined
type TitleText = { title?: Localized; text?: Localized }

type SiteContent = {
  settings: {
    address?: string | null
    phone?: string | null
    email?: string | null
    hours?: Localized
    instagram?: string | null
    facebook?: string | null
    tiktok?: string | null
  } | null
  home: {
    meta?: { title?: Localized; description?: Localized }
    hero?: { eyebrow?: Localized; title?: Localized; text?: Localized }
    ticker?: Localized[]
    nextEvent?: { eyebrow?: Localized; title?: Localized; text?: Localized }
    offer?: { eyebrow?: Localized; title?: Localized; intro?: Localized; items?: TitleText[] }
    concept?: { eyebrow?: Localized; title?: Localized; text?: Localized; materials?: Localized[] }
    gallery?: { title?: Localized }
    careers?: { title?: Localized; text?: Localized }
    visit?: { title?: Localized }
  } | null
  pages: { route?: string; title?: Localized; description?: Localized; intro?: Localized }[] | null
}

const query = `{
  "settings": *[_id == "siteSettings"][0]{address, phone, email, hours, instagram, facebook, tiktok},
  "home": *[_id == "homePage"][0]{
    meta, hero, nextEvent, gallery, careers, visit,
    ticker[]{hr, en},
    offer{eyebrow, title, intro, items[]{title, text}},
    concept{eyebrow, title, text, materials[]{hr, en}}
  },
  "pages": *[_type == "pageContent"]{"route": string::split(_id, "page-")[1], title, description, intro}
}`

export const getSiteContent = cache(() => sanityFetch<SiteContent>(query, ['sanity-content']))

function localizedValue(value: Localized, locale: Locale): string | undefined {
  return value?.[locale]?.trim() || undefined
}

function cleaned(value: string | null | undefined): string | null {
  return value?.trim() || null
}

/** Contact details, opening hours and social links: Sanity first, `lib/site.ts` as the fallback. */
export async function getSiteSettings(locale: Locale) {
  const settings = (await getSiteContent())?.settings

  return {
    contact: {
      address: cleaned(settings?.address) ?? site.contact.address,
      phone: cleaned(settings?.phone) ?? site.contact.phone,
      email: cleaned(settings?.email) ?? site.contact.email,
      hours: localizedValue(settings?.hours, locale) ?? site.contact.hours,
    },
    social: {
      instagram: cleaned(settings?.instagram) ?? site.social.instagram,
      facebook: cleaned(settings?.facebook) ?? site.social.facebook,
      tiktok: cleaned(settings?.tiktok) ?? site.social.tiktok,
    },
  }
}

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>

/** Built-in messages with every non-empty Sanity text laid over them. Empty fields keep the default copy. */
export async function getMessagesWithContent(locale: Locale): Promise<Messages> {
  const base = getMessages(locale)
  const content = await getSiteContent()
  if (!content) return base

  const m = structuredClone(base)
  const text = (value: Localized, fallback: string) => localizedValue(value, locale) ?? fallback
  const list = (values: Localized[] | undefined, fallback: string[]) => {
    const resolved = (values ?? []).map((value) => localizedValue(value, locale)).filter((value): value is string => Boolean(value))
    return resolved.length > 0 ? resolved : fallback
  }

  const { home } = content
  if (home) {
    m.meta.defaultTitle = text(home.meta?.title, m.meta.defaultTitle)
    m.meta.defaultDescription = text(home.meta?.description, m.meta.defaultDescription)

    m.home.hero.eyebrow = text(home.hero?.eyebrow, m.home.hero.eyebrow)
    m.home.hero.title = text(home.hero?.title, m.home.hero.title)
    m.home.hero.text = text(home.hero?.text, m.home.hero.text)

    m.home.ticker = list(home.ticker, m.home.ticker)

    m.home.nextEvent.eyebrow = text(home.nextEvent?.eyebrow, m.home.nextEvent.eyebrow)
    m.home.nextEvent.title = text(home.nextEvent?.title, m.home.nextEvent.title)
    m.home.nextEvent.text = text(home.nextEvent?.text, m.home.nextEvent.text)

    m.home.offer.eyebrow = text(home.offer?.eyebrow, m.home.offer.eyebrow)
    m.home.offer.title = text(home.offer?.title, m.home.offer.title)
    m.home.offer.intro = text(home.offer?.intro, m.home.offer.intro)
    m.home.offer.items = m.home.offer.items.map((item, index) => ({
      title: text(home.offer?.items?.[index]?.title, item.title),
      text: text(home.offer?.items?.[index]?.text, item.text),
    }))

    m.home.concept.eyebrow = text(home.concept?.eyebrow, m.home.concept.eyebrow)
    m.home.concept.title = text(home.concept?.title, m.home.concept.title)
    m.home.concept.text = text(home.concept?.text, m.home.concept.text)
    m.home.concept.materials = list(home.concept?.materials, m.home.concept.materials)

    m.home.gallery.title = text(home.gallery?.title, m.home.gallery.title)
    m.home.careers.title = text(home.careers?.title, m.home.careers.title)
    m.home.careers.text = text(home.careers?.text, m.home.careers.text)
    m.home.visit.title = text(home.visit?.title, m.home.visit.title)
  }

  for (const page of content.pages ?? []) {
    const route = page.route as keyof Messages['pages'] | undefined
    if (!route || !(route in m.pages)) continue

    m.pages[route].title = text(page.title, m.pages[route].title)
    m.pages[route].description = text(page.description, m.pages[route].description)

    const intro = localizedValue(page.intro, locale)
    if (!intro) continue
    if (route === 'menu') m.menu.intro = intro
    if (route === 'events') m.events.intro = intro
    if (route === 'reservations') m.reservations.intro = intro
    if (route === 'gallery') m.galleryPage.intro = intro
    if (route === 'careers') m.careersPage.subtitle = intro
  }

  return m
}
