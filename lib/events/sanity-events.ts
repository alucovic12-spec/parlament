import { eventTypes, type EventEntry, type EventStatus, type EventType, type VenueEvent } from './types'

const apiVersion = '2025-01-01'
const revalidateSeconds = 60

const query = `*[_type == "event" && defined(slug.current) && defined(start)]{
  "id": slug.current,
  type,
  title,
  description,
  performer,
  start,
  end,
  entry,
  price,
  ticketUrl,
  status,
  placeholder,
  "image": image.asset->url
}`

type SanityEvent = {
  id: string
  type?: string
  title?: { hr?: string; en?: string }
  description?: { hr?: string; en?: string }
  performer?: string | null
  start: string
  end?: string | null
  entry?: string
  price?: number | null
  ticketUrl?: string | null
  status?: string
  placeholder?: boolean
  image?: string | null
}

const entries: EventEntry[] = ['free', 'paid', 'tbc']
const statuses: EventStatus[] = ['scheduled', 'sold-out', 'cancelled', 'hidden']

function toVenueEvent(doc: SanityEvent): VenueEvent {
  const titleHr = doc.title?.hr ?? doc.title?.en ?? ''
  const titleEn = doc.title?.en ?? doc.title?.hr ?? ''
  const descriptionHr = doc.description?.hr ?? doc.description?.en ?? ''
  const descriptionEn = doc.description?.en ?? doc.description?.hr ?? ''

  return {
    id: doc.id,
    type: eventTypes.includes(doc.type as EventType) ? (doc.type as EventType) : 'special',
    title: { hr: titleHr, en: titleEn },
    description: { hr: descriptionHr, en: descriptionEn },
    performer: doc.performer ?? undefined,
    start: doc.start,
    end: doc.end ?? undefined,
    entry: entries.includes(doc.entry as EventEntry) ? (doc.entry as EventEntry) : 'tbc',
    price: doc.entry === 'paid' && typeof doc.price === 'number' ? doc.price : null,
    ticketing: { mode: 'external', url: doc.ticketUrl ?? null },
    status: statuses.includes(doc.status as EventStatus) ? (doc.status as EventStatus) : 'scheduled',
    image: doc.image ? `${doc.image}?w=1600&auto=format` : undefined,
    placeholder: doc.placeholder ?? false,
  }
}

/** Published events from Sanity, or `null` when Sanity is not configured or unreachable. */
export async function fetchSanityEvents(): Promise<VenueEvent[] | null> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  if (!projectId) return null

  const url = new URL(`https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`)
  url.searchParams.set('query', query)

  try {
    const response = await fetch(url, { next: { revalidate: revalidateSeconds, tags: ['sanity-events'] } })
    if (!response.ok) return null
    const { result } = (await response.json()) as { result: SanityEvent[] }
    return result.map(toVenueEvent)
  } catch {
    return null
  }
}
