import { LinkButton } from '@/components/shared/link-button'
import { Reveal } from '@/components/shared/reveal'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'

export function CareersTeaser({ locale, m }: { locale: Locale; m: Messages }) {
  const c = m.home.careers

  return (
    <section aria-labelledby="careers-title" className="tone-glow group relative isolate overflow-hidden py-[64px] sm:py-[70px]">
      <div
        aria-hidden
        className="absolute right-0 top-0 -z-10 h-px w-1/3 bg-brand-green/50"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 right-32 -z-10 size-56 rounded-full border border-brand-cream/8 motion-safe:transition-transform motion-safe:duration-1000 group-hover:-translate-y-3"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.26em] text-eyebrow">
            <span aria-hidden className="h-px w-10 bg-current opacity-60" />
            {c.eyebrow}
          </p>
          <h2 id="careers-title" className="mt-6 max-w-4xl text-balance font-display text-5xl font-normal leading-[1] tracking-[-0.045em] text-foreground sm:text-7xl lg:text-[6rem]">
            {c.title}
          </h2>
          <p className="mt-7 max-w-xl text-pretty text-lg font-light leading-relaxed text-muted-foreground">{c.text}</p>
          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <LinkButton href={localizedPath(locale, 'careers')}>{c.cta}</LinkButton>
            <span className="rounded-full border border-foreground/20 bg-foreground/[0.05] px-4 py-2 text-sm text-foreground/75 transition-all hover:-translate-y-0.5 hover:border-brand-green/60 hover:bg-brand-green/15 hover:text-foreground">
              {c.quick}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
