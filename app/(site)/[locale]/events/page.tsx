import type { Metadata } from 'next'
import { EventBrowser } from '@/components/events/event-browser'
import { getEvents } from '@/lib/events/get-events'
import type { Locale } from '@/lib/i18n/config'
import { getMessagesWithContent } from '@/lib/content/site-content'
import { JsonLd } from '@/components/shared/json-ld'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

export const revalidate = 60

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata(locale as Locale, 'events')
}

export default async function EventsPage({ params }: Props) {
  const locale = (await params).locale as Locale
  const m = await getMessagesWithContent(locale)
  const { upcoming, past } = await getEvents(locale)

  return (
    <main className="interior-page">
      <JsonLd data={breadcrumbJsonLd(locale, 'events')} />
      <header className="interior-hero">
        <div className="interior-hero-inner">
        <p className="interior-eyebrow">{m.events.eyebrow}</p>
        <h1 className="interior-title">{m.pages.events.title}</h1>
        <p className="interior-intro">{m.events.intro}</p>
        </div>
      </header>

      <EventBrowser locale={locale} labels={m.events} upcoming={upcoming} past={past} />
    </main>
  )
}
