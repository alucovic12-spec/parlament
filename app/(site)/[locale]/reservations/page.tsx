import type { Metadata } from 'next'
import { ReservationForm } from '@/components/reservations/reservation-form'
import { getEvent } from '@/lib/events/get-events'
import type { Locale } from '@/lib/i18n/config'
import { getMessagesWithContent } from '@/lib/content/site-content'
import { JsonLd } from '@/components/shared/json-ld'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ event?: string | string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata(locale as Locale, 'reservations')
}

export default async function ReservationsPage({ params, searchParams }: Props) {
  const locale = (await params).locale as Locale
  const { event: eventParam } = await searchParams
  const eventId = Array.isArray(eventParam) ? eventParam[0] : eventParam
  const [m, event] = await Promise.all([
    getMessagesWithContent(locale),
    eventId ? getEvent(locale, eventId) : null,
  ])
  const r = m.reservations
  const bookableEvent = event && !event.isPast && event.status === 'scheduled' ? event : null

  return (
    <main className="interior-page">
      <JsonLd data={breadcrumbJsonLd(locale, 'reservations')} />
      <header className="interior-hero">
        <div className="interior-hero-inner">
        <p className="interior-eyebrow">{r.eyebrow}</p>
        <h1 className="interior-title">{m.pages.reservations.title}</h1>
        <p className="interior-intro">{r.intro}</p>
        <p className="mt-3 text-sm font-medium text-brand-green">{r.notice}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_20rem] lg:px-8">
        <ReservationForm
          locale={locale}
          labels={r}
          event={
            bookableEvent
              ? {
                  id: bookableEvent.id,
                  title: bookableEvent.title,
                  dateLabel: bookableEvent.dateLabel,
                  timeLabel: bookableEvent.timeLabel,
                }
              : undefined
          }
        />

        <aside aria-labelledby="reservation-info" className="interior-panel h-fit p-6">
          <h2 id="reservation-info" className="font-display text-2xl">
            {r.infoTitle}
          </h2>
          <ol className="mt-4 space-y-4">
            {r.info.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span aria-hidden className="font-display text-2xl leading-none text-primary">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  )
}
