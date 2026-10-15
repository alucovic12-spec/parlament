import type { Locale } from '@/lib/i18n/config'
import { venueEvents } from './data'
import type { LocalizedEvent, VenueEvent } from './types'

const timeZone = 'Europe/Zagreb'
const intlLocale: Record<Locale, string> = { hr: 'hr-HR', en: 'en-GB' }
const defaultDurationMs = 3 * 60 * 60 * 1000

function localize(event: VenueEvent, locale: Locale, now: Date): LocalizedEvent | null {
  if (event.status === 'hidden') return null

  const start = new Date(event.start)
  const end = event.end ? new Date(event.end) : new Date(start.getTime() + defaultDurationMs)
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intlLocale[locale], { timeZone, ...options }).format(start)

  return {
    id: event.id,
    type: event.type,
    title: event.title[locale],
    description: event.description[locale],
    performer: event.performer,
    start: start.toISOString(),
    end: end.toISOString(),
    weekday: format({ weekday: 'long' }),
    day: format({ day: 'numeric' }),
    monthShort: format({ month: 'short' }).replace('.', ''),
    dateLabel: format({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    timeLabel: format({ hour: '2-digit', minute: '2-digit', hour12: false }),
    entry: event.entry,
    priceFormatted:
      event.price === null
        ? null
        : new Intl.NumberFormat(intlLocale[locale], { style: 'currency', currency: 'EUR' }).format(event.price),
    ticketUrl: event.ticketing.url,
    status: event.status,
    isPast: end.getTime() < now.getTime(),
    image: event.image,
    placeholder: event.placeholder,
  }
}

/**
 * Single data seam for the public programme. Swap the local array for a database query here
 * once the admin phase lands; callers keep receiving locale-resolved plain objects.
 */
export function getEvents(locale: Locale, now = new Date()): { upcoming: LocalizedEvent[]; past: LocalizedEvent[] } {
  const all = venueEvents
    .map((event) => localize(event, locale, now))
    .filter((event): event is LocalizedEvent => event !== null)

  const byStart = (a: LocalizedEvent, b: LocalizedEvent) => a.start.localeCompare(b.start)
  return {
    upcoming: all.filter((event) => !event.isPast).sort(byStart),
    past: all.filter((event) => event.isPast).sort((a, b) => byStart(b, a)),
  }
}

export function getEvent(locale: Locale, id: string): LocalizedEvent | null {
  const event = venueEvents.find((candidate) => candidate.id === id)
  return event ? localize(event, locale, new Date()) : null
}

export function getEventIds(): string[] {
  return venueEvents.filter((event) => event.status !== 'hidden').map((event) => event.id)
}
