import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const tones = {
  sand: 'bg-card text-foreground',
  sun: 'bg-brand-sun text-brand-ink',
  coral: 'bg-brand-green text-brand-ink',
  green: 'bg-brand-green text-brand-ink',
} as const

export type PhotoTone = keyof typeof tones

type PhotoPlaceholderProps = {
  label: string
  caption?: string
  tone?: PhotoTone
  className?: string
}

/** Colourful stand-in for official photography. Replace with next/image once material is delivered. */
export function PhotoPlaceholder({ label, tone = 'sand', className }: PhotoPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'relative flex items-end overflow-hidden rounded-2xl border-2 border-dashed border-current/30 p-4 sm:p-5',
        tones[tone],
        className,
      )}
    >
      <ImageIcon aria-hidden className="absolute right-4 top-4 size-6 text-current/45" />
    </div>
  )
}
