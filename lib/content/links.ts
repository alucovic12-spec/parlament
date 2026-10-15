import { localizedPath, routeKeys, type Locale, type PageKey } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import {
  getNavItems,
  splitMobileNav,
  type HeaderLogo,
  type NavItem,
} from '@/lib/navigation'
import { getSiteContent, type Localized, type LinkSource } from '@/lib/content/site-content'
import { site } from '@/lib/site'

const pages: string[] = ['home', ...routeKeys]
const MOBILE_BAR_SLOTS = 4

export type ResolvedLink = { href: string; external: boolean; newTab: boolean }
export type HeaderCta = ResolvedLink & { label: string }
export type HeaderAnnouncement = { text: string; link: ResolvedLink | null }
export type HeroButton = ResolvedLink & { label: string; variant: 'default' | 'outline' | 'ghost' }

export type HeaderConfig = {
  logo: HeaderLogo | null
  desktopItems: NavItem[]
  mobilePrimary: NavItem[]
  mobileMore: NavItem[]
  footerItems: NavItem[]
  cta: HeaderCta | null
  announcement: HeaderAnnouncement | null
  showLanguageSwitcher: boolean
  sticky: boolean
}

function text(value: Localized, locale: Locale): string | undefined {
  return value?.[locale]?.trim() || value?.hr?.trim() || undefined
}

export function resolveLink(link: LinkSource | null | undefined, locale: Locale): ResolvedLink | null {
  if (!link) return null
  const newTab = link.newTab === true

  if (link.kind === 'external') {
    const url = link.url?.trim()
    if (!url) return null
    return { href: url, external: /^(https?:|mailto:|tel:)/.test(url), newTab }
  }

  if (!link.page || !pages.includes(link.page)) return null
  return { href: localizedPath(locale, link.page as PageKey), external: false, newTab }
}

/** Header, menu, footer links and logo: the document in Sanity when it exists, today's built-in layout otherwise. */
export async function getHeaderConfig(locale: Locale, m: Messages): Promise<HeaderConfig> {
  const header = (await getSiteContent())?.header

  const defaults = getNavItems(locale, m)
  const defaultSplit = splitMobileNav(defaults)
  let desktopItems = defaults.filter((item) => item.key !== 'home' && item.key !== 'reservations')
  let mobilePrimary = defaultSplit.primary
  let mobileMore = defaultSplit.more
  let footerItems = defaults

  if (header?.hideNav) {
    desktopItems = []
    mobilePrimary = []
    mobileMore = []
    footerItems = []
  } else if (header?.nav?.length) {
    const entries = header.nav.flatMap((link, index) => {
      if (link.hidden) return []
      const resolved = resolveLink(link, locale)
      if (!resolved) return []
      const page = link.kind === 'external' ? null : (link.page as PageKey)
      const label = text(link.label, locale) ?? (page ? m.nav[page] : undefined)
      if (!label) return []
      const item: NavItem = { id: `nav-${index}`, key: page ?? 'external', label, ...resolved }
      return [{ item, visibility: link.visibility ?? 'all' }]
    })
    const mobile = entries.filter((entry) => entry.visibility !== 'desktop').map((entry) => entry.item)

    desktopItems = entries.filter((entry) => entry.visibility !== 'mobile').map((entry) => entry.item)
    mobilePrimary = mobile.slice(0, MOBILE_BAR_SLOTS)
    mobileMore = mobile.slice(MOBILE_BAR_SLOTS)
    footerItems = entries.map((entry) => entry.item)
  }

  const fallbackCta: HeaderCta = {
    label: m.nav.reservations,
    href: localizedPath(locale, 'reservations'),
    external: false,
    newTab: false,
  }
  const ctaLabel = text(header?.cta?.label, locale)
  const ctaLink = ctaLabel ? resolveLink(header?.cta, locale) : null
  const cta = header?.cta?.hide ? null : ctaLabel && ctaLink ? { label: ctaLabel, ...ctaLink } : fallbackCta

  const announcementText = text(header?.announcement?.text, locale)
  const announcement =
    header?.announcement?.show && announcementText
      ? { text: announcementText, link: resolveLink(header.announcement, locale) }
      : null

  const logoUrl = header?.logo?.url
  const logo = logoUrl
    ? {
        url: logoUrl,
        width: header?.logo?.width || 600,
        height: header?.logo?.height || 200,
        alt: header?.logoAlt?.trim() || site.name,
        heightPx: header?.logoHeight || 40,
      }
    : null

  return {
    logo,
    desktopItems,
    mobilePrimary,
    mobileMore,
    footerItems,
    cta,
    announcement,
    showLanguageSwitcher: header?.showLanguageSwitcher !== false,
    sticky: header?.stickyHeader !== false,
  }
}

const buttonVariants = { default: 'default', outline: 'outline', ghost: 'ghost' } as const

/** Hero buttons: what the editor set up, or the three built-in ones when nothing was configured. */
export async function getHeroButtons(locale: Locale, m: Messages): Promise<HeroButton[]> {
  const hero = (await getSiteContent())?.home?.hero
  if (hero?.hideButtons) return []

  const custom = (hero?.buttons ?? []).flatMap((button) => {
    const label = text(button.label, locale)
    const link = label ? resolveLink(button, locale) : null
    if (!label || !link) return []
    const variant = buttonVariants[button.style as keyof typeof buttonVariants] ?? 'default'
    return [{ label, variant, ...link }]
  })
  if (custom.length > 0) return custom

  const h = m.home.hero
  const internal = (page: PageKey, label: string, variant: HeroButton['variant']): HeroButton => ({
    label,
    variant,
    href: localizedPath(locale, page),
    external: false,
    newTab: false,
  })
  return [
    internal('reservations', h.reserve, 'default'),
    internal('menu', h.viewMenu, 'outline'),
    internal('events', h.viewEvents, 'ghost'),
  ]
}
