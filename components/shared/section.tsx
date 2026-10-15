import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const tones = {
  base: 'tone-base',
  raised: 'tone-sand',
  sand: 'tone-sand',
  green: 'tone-green',
  sun: 'tone-sand',
  ink: 'tone-ink',
  night: 'tone-night',
  dusk: 'tone-dusk',
} as const

type SectionProps = {
  id?: string
  labelledBy?: string
  tone?: keyof typeof tones
  compact?: boolean
  className?: string
  sectionClassName?: string
  children: ReactNode
}

export function Section({ id, labelledBy, tone = 'base', compact = false, className, sectionClassName, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(tones[tone], 'section-atmosphere relative overflow-x-clip', compact ? 'py-10 sm:py-14' : 'py-24 sm:py-32', sectionClassName)}
    >
      <div className={cn('relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
    </section>
  )
}

type SectionHeadingProps = {
  id: string
  eyebrow?: string
  title?: string
  intro?: string
  className?: string
}

export function SectionHeading({ id, eyebrow, title, intro, className }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl', className)}>
      {eyebrow ? (
        <p className="font-accent inline-flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-eyebrow">
          <span aria-hidden className="h-px w-10 bg-current opacity-60" />
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 id={id} className="mt-5 max-w-[16ch] text-balance font-display text-4xl font-normal leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
          {title}
        </h2>
      ) : null}
      {intro ? <p className="mt-6 max-w-2xl text-pretty text-base font-light leading-relaxed text-muted-foreground sm:text-lg">{intro}</p> : null}
    </div>
  )
}
