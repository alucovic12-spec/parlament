import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EventActions } from '@/components/events/event-actions'
import { EventBadges } from '@/components/events/event-badges'
import { EventCta } from '@/components/events/event-cta'
import { eventPriceText } from '@/components/events/event-price'
import { JsonLd } from '@/components/shared/json-ld'
import { PhotoPlaceholder } from '@/components/shared/photo-placeholder'
import { getEvent, getEventIds } from '@/lib/events/get-events'
import { isLocale, localizedPath, locales, type Locale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { absoluteUrl, alternateLanguages, breadcrumbJsonLd, defaultOgImage } from '@/lib/seo'
import { getSiteUrl, site } from '@/lib/site'

export const revalidate = 3600

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return locales.flatMap((locale) => getEventIds().map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const event = getEvent(locale, slug)
  if (!event) return {}

  const m = getMessages(locale)
  const canonical = localizedPath(locale, 'events', [slug])
  const image = event.image ? { url: event.image, alt: event.title } : defaultOgImage

  return {
    title: event.title,
    description: event.description,
    alternates: { canonical, languages: alternateLanguages('events', [slug]) },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: `${event.title} | ${site.shortName}`,
      description: event.description,
      url: canonical,
      locale: m.meta.ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => getMessages(l).meta.ogLocale),
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: event.title, description: event.description, images: [image.url] },
  }
}

export default async function EventPage({ params }: Props) {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale)) notFound()
  const locale: Locale = rawLocale
  const event = getEvent(locale, slug)
  if (!event) notFound()

  const m = getMessages(locale)
  const labels = m.events
  const eventsHref = localizedPath(locale, 'events')

  const jsonLd = event.placeholder
    ? null
    : {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: event.description,
        startDate: event.start,
        endDate: event.end,
        eventStatus:
          event.status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        url: absoluteUrl(localizedPath(locale, 'events', [slug])),
        inLanguage: locale,
        image: absoluteUrl(event.image ?? defaultOgImage.url),
        organizer: { '@type': 'Organization', name: site.name, url: getSiteUrl() },
        location: {
          '@type': 'Place',
          name: site.name,
          ...(site.contact.address ? { address: site.contact.address } : {}),
        },
        ...(event.performer ? { performer: { '@type': 'PerformingGroup', name: event.performer } } : {}),
      }

  return (
    <article className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      ) : null}
      <JsonLd data={breadcrumbJsonLd(locale, 'events', { name: event.title, rest: [slug] })} />

      <Link
        href={eventsHref}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {labels.back}
      </Link>

      <header className="mt-6">
        <EventBadges event={event} labels={labels} />
        <h1 className="mt-4 text-balance font-display text-3xl leading-tight sm:text-5xl">{event.title}</h1>
        {event.performer ? <p className="mt-3 text-lg text-muted-foreground">{event.performer}</p> : null}
      </header>

      {event.isPast || event.status === 'cancelled' ? (
        <p role="note" className="mt-6 rounded-2xl border border-border bg-muted px-5 py-4 text-sm">
          {event.status === 'cancelled' ? labels.cancelledNotice : labels.pastNotice}
        </p>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {event.image ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
              <Image src={event.image} alt={event.title} fill priority sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
            </div>
          ) : (
            <PhotoPlaceholder label={labels.photoLabel} className="aspect-[16/9]" />
          )}

          <h2 className="mt-10 font-display text-3xl">{labels.about}</h2>
          <p className="mt-3 max-w-prose text-pretty leading-relaxed text-muted-foreground">{event.description}</p>
        </div>

        <aside aria-labelledby="event-info" className="h-fit rounded-2xl border border-border bg-card p-6">
          <h2 id="event-info" className="font-display text-2xl">
            {labels.infoTitle}
          </h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{labels.date}</dt>
              <dd className="mt-1 capitalize">
                <time dateTime={event.start}>{event.dateLabel}</time>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{labels.time}</dt>
              <dd className="mt-1">{event.timeLabel}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{labels.entry}</dt>
              <dd className="mt-1 text-primary">{eventPriceText(event, labels)}</dd>
            </div>
          </dl>

          <EventCta event={event} locale={locale} labels={labels} className="mt-6 w-full" />

          <div className="mt-6 border-t border-border pt-6">
            <EventActions
              id={event.id}
              title={event.title}
              description={event.description}
              start={event.start}
              end={event.end}
              location={site.contact.address ?? site.name}
              labels={labels}
            />
          </div>
        </aside>
      </div>
    </article>
  )
}
