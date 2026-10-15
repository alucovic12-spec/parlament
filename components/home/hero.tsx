import { HeroAnnouncements } from '@/components/home/hero-announcements'
import { HeroSlides } from '@/components/home/hero-slides'
import { LinkButton } from '@/components/shared/link-button'
import { getHeroButtons } from '@/lib/content/links'
import type { LocalizedEvent } from '@/lib/events/types'
import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { linkAttrs } from '@/lib/navigation'

type HeroProps = { locale: Locale; m: Messages; images: string[]; events?: LocalizedEvent[] }

export async function Hero({ locale, m, images, events = [] }: HeroProps) {
  const h = m.home.hero
  const buttons = await getHeroButtons(locale, m)
  const slides = images.map((src) => ({ src }))
  const [firstLine, ...rest] = h.title.split(/(?<=\.)\s+/)
  const secondLine = rest.join(' ')
  const slideLabels = slides.map((_, index) =>
    locale === 'hr' ? `Slika ${index + 1} od ${slides.length}` : `Image ${index + 1} of ${slides.length}`,
  )

  return (
    <section
      aria-labelledby="hero-title"
      className="tone-photo relative isolate flex min-h-[min(52rem,calc(100svh-4.5rem))] flex-col justify-end overflow-hidden bg-brand-ink"
    >
      <div className="absolute inset-x-0 top-0 -z-20 h-[48svh] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[78%]">
        {slides.length > 0 ? <HeroSlides slides={slides} labels={slideLabels} /> : null}
      </div>

      {/* Dissolves the photos into the ink background: bottom edge on mobile, left edge on desktop, plus a soft top edge under the header. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[48svh] bg-gradient-to-t from-brand-ink via-brand-ink/60 to-transparent lg:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden bg-[linear-gradient(to_right,var(--brand-ink)_0%,var(--brand-ink)_20%,color-mix(in_oklab,var(--brand-ink)_70%,transparent)_38%,transparent_68%)] lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-48 bg-gradient-to-t from-brand-ink to-transparent lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-brand-ink/80 to-transparent"
      />

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-brand-ink/50 to-transparent" />

      <div className="pointer-events-none mx-auto w-full max-w-[90rem] px-4 pb-12 pt-[38svh] sm:px-6 sm:pb-16 lg:px-8 lg:pb-12 lg:pt-14 [&>*]:pointer-events-auto">
        {h.eyebrow ? (
          <p className="font-accent fade-up inline-flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.32em] text-brand-green">
            <span aria-hidden className="h-px w-10 bg-brand-gold" />
            {h.eyebrow}
          </p>
        ) : null}
        <h1
          id="hero-title"
          style={{ animationDelay: '100ms' }}
          className="warm-title fade-up mt-5 max-w-5xl text-balance font-display text-5xl font-normal leading-[0.98] tracking-[-0.045em] sm:text-7xl xl:text-[6.5rem]"
        >
          <span className="block">{firstLine}</span>
          {secondLine ? (
            <span className="mt-2 block w-fit rounded-2xl border border-brand-cream/20 bg-brand-ink/40 px-4 py-2 text-brand-cream shadow-none backdrop-blur-md sm:px-6">
              {secondLine}
            </span>
          ) : null}
        </h1>
        {h.text ? (
          <p
            style={{ animationDelay: '220ms' }}
            className="fade-up mt-6 max-w-xl text-pretty text-base font-light leading-relaxed text-brand-cream/80 sm:text-lg"
          >
            {h.text}
          </p>
        ) : null}
        {buttons.length > 0 ? (
          <div style={{ animationDelay: '340ms' }} className="fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {buttons.map((button, index) => (
              <LinkButton
                key={`${button.href}-${index}`}
                href={button.href}
                variant={button.variant}
                {...linkAttrs(button)}
                className="w-full sm:w-auto"
              >
                {button.label}
              </LinkButton>
            ))}
          </div>
        ) : null}

        <ul
          style={{ animationDelay: '460ms' }}
          className="fade-up mt-10 flex flex-wrap gap-2 text-xs uppercase tracking-wider"
        >
          {h.moments.map((moment) => (
            <li
              key={moment}
              className="rounded-full border border-brand-cream/20 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-green/70 hover:bg-brand-green/15 hover:text-brand-cream"
            >
              {moment}
            </li>
          ))}
        </ul>

        <HeroAnnouncements locale={locale} m={m} events={events} />
      </div>
    </section>
  )
}
