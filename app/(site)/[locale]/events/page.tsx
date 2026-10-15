import type { Metadata } from 'next'
import { EventBrowser } from '@/components/events/event-browser'
import { getEvents } from '@/lib/events/get-events'
import type { Locale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { JsonLd } from '@/components/shared/json-ld'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const revalidate = 3600

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata(locale as Locale, 'events')
}

export default async function EventsPage({ params }: Props) {
  const locale = (await params).locale as Locale
  const m = getMessages(locale)
  const { upcoming, past } = getEvents(locale)
  const showNotice = site.showPlaceholders && [...upcoming, ...past].some((event) => event.placeholder)

  return (
    <main className="interior-page">
      <JsonLd data={breadcrumbJsonLd(locale, 'events')} />
      <header className="interior-hero">
        <div className="interior-hero-inner">
        <p className="interior-eyebrow">{m.events.eyebrow}</p>
        <h1 className="interior-title">{m.pages.events.title}</h1>
        <p className="interior-intro">{m.events.intro}</p>
        {showNotice ? (
          <p className="mt-5 inline-block rounded-full border border-dashed border-foreground/30 px-4 py-2 text-xs text-muted-foreground">
            {m.events.temporaryNotice}
          </p>
        ) : null}
        </div>
      </header>

      <EventBrowser locale={locale} labels={m.events} upcoming={upcoming} past={past} />
    </main>
  )
}
