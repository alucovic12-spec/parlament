import type { Localized } from '@/lib/menu/types'

export const eventTypes = ['live-music', 'dj', 'quiz', 'tasting', 'special'] as const
export type EventType = (typeof eventTypes)[number]

/** `hidden` removes the event from the public site without deleting it. */
export type EventStatus = 'scheduled' | 'sold-out' | 'cancelled' | 'hidden'

/** `tbc` means the entry conditions are not confirmed yet. */
export type EventEntry = 'free' | 'paid' | 'tbc'

/** Only external ticketing exists today; a `qr` mode can be added here when in-house tickets land. */
export type EventTicketing = { mode: 'external'; url: string | null }

export type VenueEvent = {
  id: string
  type: EventType
  title: Localized
  description: Localized
  performer?: string
  /** ISO 8601 with offset, in venue time. */
  start: string
  end?: string
  entry: EventEntry
  /** Ticket price in EUR. `null` until confirmed. */
  price: number | null
  ticketing: EventTicketing
  status: EventStatus
  image?: string
  /** True while the entry is sample content that must be replaced or confirmed. */
  placeholder: boolean
}

export type LocalizedEvent = {
  id: string
  type: EventType
  title: string
  description: string
  performer?: string
  start: string
  end: string
  weekday: string
  day: string
  monthShort: string
  dateLabel: string
  timeLabel: string
  entry: EventEntry
  priceFormatted: string | null
  ticketUrl: string | null
  status: Exclude<EventStatus, 'hidden'>
  isPast: boolean
  image?: string
  placeholder: boolean
}
