import { cn } from '@/lib/utils'
import type { Messages } from '@/lib/i18n/messages'
import type { LocalizedMenuItem } from '@/lib/menu/types'

type Props = {
  item: LocalizedMenuItem
  labels: Messages['menu']
  formatPrice: (value: number) => string
}

export function MenuItemCard({ item, labels, formatPrice }: Props) {
  const tags = [
    ...item.tags.map((tag) => ({ key: tag, label: labels.tags[tag], tone: 'gold' as const })),
    ...(item.unavailable ? [{ key: 'unavailable', label: labels.tags.unavailable, tone: 'muted' as const }] : []),
  ]

  return (
    <li className={cn('border-b border-border/60 py-2.5', item.unavailable && 'opacity-55')}>
      <div className="flex items-baseline gap-2">
        <h3 className="min-w-0 text-[0.95rem] font-medium leading-snug text-foreground">{item.name}</h3>
        {item.volume ? <span className="shrink-0 text-xs text-muted-foreground">{item.volume}</span> : null}
        <span aria-hidden className="mx-1 min-w-4 flex-1 -translate-y-[3px] border-b border-dotted border-foreground/20" />
        <p className="shrink-0 text-sm tabular-nums text-primary">
          {item.price === null ? (
            <span className="text-xs text-muted-foreground">{labels.pricePending}</span>
          ) : (
            formatPrice(item.price)
          )}
        </p>
      </div>

      {item.description ? (
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
      ) : null}

      {tags.length > 0 || item.allergens.length > 0 ? (
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] text-muted-foreground">
          {tags.map((tag) => (
            <span
              key={tag.key}
              className={cn(
                'rounded-full px-1.5 py-px font-medium',
                tag.tone === 'gold' && 'bg-primary/15 text-primary',
                tag.tone === 'muted' && 'bg-muted text-foreground',
              )}
            >
              {tag.label}
            </span>
          ))}
          {item.allergens.length > 0 ? (
            <span>
              {labels.allergens}: {item.allergens.join(', ')}
            </span>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
