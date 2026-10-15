import type { Metadata } from 'next'
import { EventCard } from '@/components/events/event-card'
import { LinkButton } from '@/components/shared/link-button'
import { getEvents } from '@/lib/events/get-events'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { JsonLd } from '@/components/shared/json-ld'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const revalidate = 3600

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata(locale as Locale, 'tickets')
}

export default async function TicketsPage({ params }: Props) {
  const locale = (await params).locale as Locale
  const m = getMessages(locale)
  const ticketed = getEvents(locale).upcoming.filter(
    (event) => event.entry !== 'free' && event.status !== 'cancelled',
  )

  return (
    <main className="interior-page">
      <JsonLd data={breadcrumbJsonLd(locale, 'tickets')} />
      <header className="interior-hero">
        <div className="interior-hero-inner">
        <p className="interior-eyebrow">{m.tickets.eyebrow}</p>
        <h1 className="interior-title">{m.pages.tickets.title}</h1>
        <p className="interior-intro">{m.tickets.intro}</p>
        {site.showPlaceholders ? (
          <p className="mt-5 inline-block max-w-xl rounded-2xl border border-dashed border-foreground/30 px-4 py-2 text-xs text-muted-foreground">
            {m.tickets.temporaryNotice}
          </p>
        ) : null}
        </div>
      </header>

      <section aria-labelledby="tickets-how" className="border-y border-border bg-brand-sand/50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 id="tickets-how" className="font-display text-3xl sm:text-4xl">
            {m.tickets.howTitle}
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {m.tickets.steps.map((step, index) => (
              <li key={step.title} className="interior-panel glow-card p-6">
                <span aria-hidden className="font-display text-4xl text-primary">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-lg">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="tickets-list" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <h2 id="tickets-list" className="font-display text-3xl sm:text-4xl">
          {m.tickets.listTitle}
        </h2>

        {ticketed.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-foreground/25 p-10 text-center">
            <h3 className="font-display text-3xl">{m.tickets.emptyTitle}</h3>
            <p className="mt-2 text-muted-foreground">{m.tickets.emptyText}</p>
            <LinkButton href={localizedPath(locale, 'events')} variant="outline" className="mt-6">
              {m.tickets.viewProgram}
            </LinkButton>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {ticketed.map((event) => (
              <EventCard key={event.id} event={event} locale={locale} labels={m.events} headingLevel="h3" />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
