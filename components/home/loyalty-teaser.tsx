import { LinkButton } from '@/components/shared/link-button'
import { Reveal } from '@/components/shared/reveal'
import { Section, SectionHeading } from '@/components/shared/section'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { site } from '@/lib/site'

export function LoyaltyTeaser({ locale, m }: { locale: Locale; m: Messages }) {
  const l = m.home.loyalty

  return (
    <Section labelledBy="loyalty-title" tone="green" sectionClassName="!pt-[85px] !pb-[61px]">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <SectionHeading id="loyalty-title" eyebrow={l.eyebrow} title={l.title} intro={l.text} />
          <LinkButton href={localizedPath(locale, 'loyalty')} className="mt-10">
            {l.cta}
          </LinkButton>
        </Reveal>

        <Reveal>
          <div className="group relative isolate mx-auto w-full max-w-md py-6">
            <div
              aria-hidden
              className="absolute inset-x-6 inset-y-0 -z-10 rounded-[2.5rem] bg-brand-cream/55 motion-safe:transition-transform motion-safe:duration-700 group-hover:translate-y-1.5"
            />
            <div
              role="img"
              aria-label={m.nav.loyalty}
              className="tone-ink relative aspect-[1.586/1] w-full overflow-hidden rounded-[2.25rem] border border-brand-cream/15 p-7 shadow-[0_28px_60px_-36px_rgb(0_0_0_/_55%)] motion-safe:transition-all motion-safe:duration-700 group-hover:-translate-y-1"
            >
              <div
                aria-hidden
                className="absolute -right-12 -top-12 size-48 rounded-full bg-brand-green/10 motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-110"
              />
              <p className="relative font-display text-2xl font-medium uppercase tracking-[0.06em] text-brand-cream">Parlament</p>
              <p className="relative mt-1 text-[0.625rem] uppercase tracking-[0.34em] text-brand-cream/80">People’s Bar</p>
              <div className="absolute inset-x-7 bottom-7 flex items-end justify-between">
                <div>
                  <p className="text-[0.625rem] uppercase tracking-[0.22em] text-muted-foreground">{m.nav.loyalty}</p>
                  <p className="mt-1 font-mono text-lg tracking-widest">PRL 0000 0000</p>
                </div>
                {site.showPlaceholders ? (
                  <span className="rounded-full border border-dashed border-foreground/40 px-2.5 py-1 text-[0.625rem] text-muted-foreground">
                    {m.placeholder.pending}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
