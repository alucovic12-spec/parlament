import { ExternalLink } from 'lucide-react'
import { LinkButton } from '@/components/shared/link-button'
import type { LocalizedEvent } from '@/lib/events/types'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { cn } from '@/lib/utils'

type Props = {
  event: LocalizedEvent
  locale: Locale
  labels: Messages['events']
  className?: string
}

const disabledClass =
  'inline-flex h-12 items-center justify-center rounded-full border border-dashed border-foreground/30 px-6 text-sm text-muted-foreground'

export function EventCta({ event, locale, labels, className }: Props) {
  if (event.isPast || event.status === 'cancelled') return null

  if (event.status === 'sold-out') {
    return <span className={cn(disabledClass, className)}>{labels.status.soldOut}</span>
  }

  if (event.entry === 'paid') {
    if (!event.ticketUrl) {
      return <span className={cn(disabledClass, className)}>{labels.ticketSoon}</span>
    }
    return (
      <LinkButton href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {labels.buyTicket}
        <ExternalLink aria-hidden className="ml-2 size-4" />
        <span className="sr-only"> (new tab)</span>
      </LinkButton>
    )
  }

  return (
    <LinkButton href={localizedPath(locale, 'reservations')} className={className}>
      {labels.reserve}
    </LinkButton>
  )
}
