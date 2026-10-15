import { isContentImported } from '@/lib/content/imported'
import type { Locale } from '@/lib/i18n/config'
import { venueEvents } from './data'
import { fetchSanityEvents } from './sanity-events'
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

/** Sanity events override local entries that share the same slug. */
async function getAllEvents(): Promise<VenueEvent[]> {
  const [fetched, imported] = await Promise.all([fetchSanityEvents(), isContentImported()])
  if (imported && fetched) return fetched

  const remote = fetched ?? []
  const remoteIds = new Set(remote.map((event) => event.id))
  return [...venueEvents.filter((event) => !remoteIds.has(event.id)), ...remote]
}

/**
 * Single data seam for the public programme: events published in Sanity plus the local list.
 * Callers receive locale-resolved plain objects.
 */
export async function getEvents(
  locale: Locale,
  now = new Date(),
): Promise<{ upcoming: LocalizedEvent[]; past: LocalizedEvent[] }> {
  const all = (await getAllEvents())
    .map((event) => localize(event, locale, now))
    .filter((event): event is LocalizedEvent => event !== null)

  const byStart = (a: LocalizedEvent, b: LocalizedEvent) => a.start.localeCompare(b.start)
  return {
    upcoming: all.filter((event) => !event.isPast).sort(byStart),
    past: all.filter((event) => event.isPast).sort((a, b) => byStart(b, a)),
  }
}

export async function getEvent(locale: Locale, id: string): Promise<LocalizedEvent | null> {
  const event = (await getAllEvents()).find((candidate) => candidate.id === id)
  return event ? localize(event, locale, new Date()) : null
}

export async function getEventIds(): Promise<string[]> {
  return (await getAllEvents()).filter((event) => event.status !== 'hidden').map((event) => event.id)
}
