import type { LocalizedEvent } from '@/lib/events/types'
import type { Messages } from '@/lib/i18n/messages'
import { cn } from '@/lib/utils'

type Tone = 'gold' | 'muted' | 'dashed'

export function EventBadges({ event, labels }: { event: LocalizedEvent; labels: Messages['events'] }) {
  const tags: { key: string; label: string; tone: Tone }[] = [
    { key: 'type', label: labels.types[event.type], tone: 'gold' },
  ]
  if (event.status === 'sold-out') tags.push({ key: 'sold-out', label: labels.status.soldOut, tone: 'muted' })
  if (event.status === 'cancelled') tags.push({ key: 'cancelled', label: labels.status.cancelled, tone: 'muted' })
  if (event.isPast && event.status !== 'cancelled') tags.push({ key: 'past', label: labels.status.past, tone: 'muted' })

  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag.key}
          className={cn(
            'rounded-full px-2.5 py-1 text-[0.6875rem] font-medium',
            tag.tone === 'gold' && 'bg-primary/15 text-primary',
            tag.tone === 'muted' && 'bg-muted text-foreground',
          )}
        >
          {tag.label}
        </li>
      ))}
    </ul>
  )
}
