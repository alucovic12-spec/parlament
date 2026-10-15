import type { Metadata } from 'next'
import { LinkButton } from '@/components/shared/link-button'
import { localizedPath, type Locale, type RouteKey } from '@/lib/i18n/config'
import { getMessagesWithContent } from '@/lib/content/site-content'
import { JsonLd } from '@/components/shared/json-ld'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

/**
 * Temporary route body for pages that are built in a later phase.
 * Each route file swaps this factory for its real page component when its phase is implemented.
 */
export function upcomingRoute(key: RouteKey) {
  async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params
    return buildMetadata(locale as Locale, key)
  }

  async function Page({ params }: Props) {
    const locale = (await params).locale as Locale
    const m = await getMessagesWithContent(locale)
    return (
      <main className="interior-page flex min-h-[75svh] items-center">
        <JsonLd data={breadcrumbJsonLd(locale, key)} />
        <div className="interior-hero-inner py-24">
        <p className="interior-eyebrow">{m.upcoming.eyebrow}</p>
        <h1 className="interior-title">{m.pages[key].title}</h1>
        <p className="interior-intro">{m.upcoming.text}</p>
        <LinkButton href={localizedPath(locale, 'home')} variant="outline" className="mt-8">
          {m.upcoming.back}
        </LinkButton>
        </div>
      </main>
    )
  }

  return { generateMetadata, Page }
}
