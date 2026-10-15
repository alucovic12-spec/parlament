'use client'

import { CmsImage as Image } from '@/components/shared/cms-image'
import { useMemo, useState } from 'react'
import { PhotoPlaceholder } from '@/components/shared/photo-placeholder'
import { galleryCategories, type GalleryAspect, type GalleryCategory, type GalleryTile } from '@/lib/gallery/types'
import type { Messages } from '@/lib/i18n/messages'
import { cn } from '@/lib/utils'
import { Lightbox } from './lightbox'

type Filter = GalleryCategory | 'all'

const tileShape: Record<GalleryAspect, string> = {
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
  landscape: 'aspect-[3/2]',
}

export function GalleryBrowser({
  items,
  labels,
  placeholderLabel,
}: {
  items: GalleryTile[]
  labels: Messages['galleryPage']
  placeholderLabel: string
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const availableCategories = useMemo(
    () => galleryCategories.filter((category) => items.some((item) => item.category === category)),
    [items],
  )
  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.category === filter)),
    [items, filter],
  )

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: labels.all },
    ...availableCategories.map((category) => ({ id: category, label: labels.categories[category] })),
  ]

  return (
    <div>
      <div role="group" aria-label={labels.filterLabel} className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              'h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              filter === item.id
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-foreground/70 hover:border-foreground/40 hover:bg-accent hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p role="status" className="mt-4 text-sm text-muted-foreground">
        {labels.shown}: {visible.length}
      </p>

      {visible.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{labels.empty}</p>
      ) : (
        <ul className="mt-6 columns-2 gap-3 sm:gap-5 lg:columns-3">
          {visible.map((item, index) => (
            <li key={item.id} className="mb-3 break-inside-avoid sm:mb-5">
              <button
                type="button"
                aria-label={`${labels.open}: ${item.caption}`}
                onClick={() => setOpenIndex(index)}
                className={cn(
                  'glow-card group relative block w-full overflow-hidden rounded-[1.5rem] border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  tileShape[item.aspect],
                )}
              >
                {item.image ? (
                  <Image
                    src={item.image.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 30vw, 50vw"
                    className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                  />
                ) : (
                  <PhotoPlaceholder
                    label={placeholderLabel}
                    caption={item.caption}
                    className="size-full transition-colors group-hover:border-primary/60"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <Lightbox
        items={visible}
        index={openIndex}
        labels={labels}
        placeholderLabel={placeholderLabel}
        onIndexChange={setOpenIndex}
      />
    </div>
  )
}
