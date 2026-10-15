import { CmsImage as Image } from '@/components/shared/cms-image'
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
    ...(item.placeholder ? [{ key: 'placeholder', label: labels.tags.placeholder, tone: 'dashed' as const }] : []),
  ]

  return (
    <li
      className={cn(
        'glow-card flex gap-4 rounded-2xl border border-border bg-card p-4 text-card-foreground transition-all hover:border-foreground/25 sm:p-5',
        item.unavailable && 'opacity-60',
      )}
    >
      {item.image ? (
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl sm:size-24">
          <Image src={item.image} alt="" fill sizes="96px" className="object-cover" />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-medium leading-snug tracking-[-0.03em] text-foreground sm:text-2xl">{item.name}</h3>
          <p className="shrink-0 pt-1 text-sm text-primary">
            {item.price === null ? (
              <span className="font-normal text-muted-foreground">{labels.pricePending}</span>
            ) : (
              formatPrice(item.price)
            )}
          </p>
        </div>

        {item.volume ? <p className="mt-0.5 text-xs text-muted-foreground">{item.volume}</p> : null}
        {item.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        ) : null}

        {tags.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag.key}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[0.6875rem] font-medium',
                  tag.tone === 'gold' && 'bg-primary/15 text-primary',
                  tag.tone === 'muted' && 'bg-muted text-foreground',
                  tag.tone === 'dashed' && 'border border-dashed border-foreground/30 text-muted-foreground',
                )}
              >
                {tag.label}
              </li>
            ))}
          </ul>
        ) : null}

        {item.allergens.length > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="">{labels.allergens}:</span> {item.allergens.join(', ')}
          </p>
        ) : null}
      </div>
    </li>
  )
}
