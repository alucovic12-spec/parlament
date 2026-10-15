import type { Messages } from '@/lib/i18n/messages'
import type { LocalizedEvent } from '@/lib/events/types'

export function eventPriceText(event: LocalizedEvent, labels: Messages['events']): string {
  if (event.entry === 'free') return labels.free
  if (event.entry === 'paid' && event.priceFormatted) return event.priceFormatted
  return labels.pricePending
}
