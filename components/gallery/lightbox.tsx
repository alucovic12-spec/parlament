'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CmsImage as Image } from '@/components/shared/cms-image'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { PhotoPlaceholder } from '@/components/shared/photo-placeholder'
import { Button } from '@/components/ui/button'
import type { Messages } from '@/lib/i18n/messages'
import type { GalleryTile } from '@/lib/gallery/types'
import { cn } from '@/lib/utils'

const placeholderShape = {
  portrait: 'aspect-[4/5] h-[min(60dvh,36rem)]',
  square: 'aspect-square h-[min(60dvh,32rem)]',
  landscape: 'aspect-[3/2] w-[min(88vw,48rem)]',
} as const

type LightboxProps = {
  items: GalleryTile[]
  index: number | null
  labels: Messages['galleryPage']
  placeholderLabel: string
  onIndexChange: (index: number | null) => void
}

export function Lightbox({ items, index, labels, placeholderLabel, onIndexChange }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isOpen = index !== null
  const item = index !== null ? items[index] : undefined

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  function step(direction: 1 | -1) {
    if (index === null) return
    onIndexChange((index + direction + items.length) % items.length)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={labels.dialog}
      onClose={() => onIndexChange(null)}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onIndexChange(null)
      }}
      className="m-0 h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 text-foreground bg-background backdrop:bg-background"
    >
      {item && index !== null ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {index + 1} {labels.of} {items.length}
            </p>
            <Button type="button" variant="outline" size="icon" aria-label={labels.close} onClick={() => onIndexChange(null)}>
              <X aria-hidden className="size-5" />
            </Button>
          </div>

          <div
            className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 sm:gap-4 sm:px-6"
            onClick={(event) => {
              if (event.target === event.currentTarget) onIndexChange(null)
            }}
          >
            <Button type="button" variant="outline" size="icon" aria-label={labels.prev} onClick={() => step(-1)}>
              <ChevronLeft aria-hidden className="size-5" />
            </Button>

            <figure key={item.id} className="flex min-w-0 flex-col items-center gap-4">
              {item.image ? (
                <Image
                  src={item.image.src}
                  width={item.image.width}
                  height={item.image.height}
                  alt={item.alt}
                  sizes="90vw"
                  priority
                  className="max-h-[70dvh] w-auto max-w-full rounded-2xl object-contain"
                />
              ) : (
                <PhotoPlaceholder label={placeholderLabel} className={cn('max-w-full', placeholderShape[item.aspect])} />
              )}
              {item.caption ? (
                <figcaption className="text-center text-sm text-muted-foreground">{item.caption}</figcaption>
              ) : null}
            </figure>

            <Button type="button" variant="outline" size="icon" aria-label={labels.next} onClick={() => step(1)}>
              <ChevronRight aria-hidden className="size-5" />
            </Button>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}
