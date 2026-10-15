import { CalendarDays } from 'lucide-react'
import { CmsImage as Image } from '@/components/shared/cms-image'
import { LinkButton } from '@/components/shared/link-button'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import type { HeroButton } from '@/lib/content/links'
import type { LocalizedEvent } from '@/lib/events/types'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { linkAttrs } from '@/lib/navigation'
import { site } from '@/lib/site'

type Props = {
  locale: Locale
  m: Messages
  image: string | null
  event?: LocalizedEvent
  buttons: HeroButton[] | null
}

export function NextEvent({ locale, m, image, event, buttons }: Props) {
  const n = m.home.nextEvent
  const photo = event?.image ?? image
  const showNote = site.showPlaceholders && (event ? event.placeholder : true)

  return (
    <Section labelledBy="next-event-title" tone="base" compact>
      <Reveal>
        <div className="tone-ink glow-card group grid overflow-hidden rounded-[2rem] border border-border bg-brand-anthracite md:grid-cols-[1.2fr_1fr]">
          <div className="image-reveal relative min-h-72 overflow-hidden md:min-h-full">
            {photo ? (
            <Image
              src={photo}
              alt=""
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover motion-safe:transition-transform motion-safe:duration-1000 group-hover:scale-105"
            />
            ) : null}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-brand-ink/80" />
            <span
              aria-hidden
              className="absolute left-5 top-5 flex size-14 items-center justify-center rounded-2xl border border-brand-cream/20 bg-brand-ink/70 text-brand-green backdrop-blur-md"
            >
              <CalendarDays className="size-6" />
            </span>
          </div>

          <div className="flex flex-col justify-between gap-10 p-6 sm:p-12">
            <div>
              {n.eyebrow ? (
                <p className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.26em] text-eyebrow">
                  <span aria-hidden className="h-px w-10 bg-current opacity-60" />
                  {n.eyebrow}
                </p>
              ) : null}
              <h2 id="next-event-title" className="mt-5 text-balance font-display text-4xl font-normal leading-[1.02] tracking-[-0.04em] sm:text-6xl">
                {event ? event.title : n.title}
              </h2>
              {event ? (
                <p className="mt-5 text-lg text-brand-gold">
                  <time dateTime={event.start} className="capitalize">
                    {event.dateLabel}, {event.timeLabel}
                  </time>
                </p>
              ) : n.text ? (
                <p className="mt-5 max-w-xl text-lg text-muted-foreground">{n.text}</p>
              ) : null}
              {showNote ? (
                <p className="mt-5 inline-block rounded-full border border-dashed border-foreground/30 px-3 py-1 text-xs text-muted-foreground">
                  {n.note}
                </p>
              ) : null}
            </div>
            {buttons ? (
              buttons.length > 0 ? (
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
                  {buttons.map((button, index) => (
                    <LinkButton key={`${button.href}-${index}`} href={button.href} variant={button.variant} {...linkAttrs(button)}>
                      {button.label}
                    </LinkButton>
                  ))}
                </div>
              ) : null
            ) : (
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {event ? (
                  <LinkButton href={localizedPath(locale, 'events', [event.id])}>{m.events.details}</LinkButton>
                ) : null}
                <LinkButton href={localizedPath(locale, 'events')} variant={event ? 'outline' : 'default'}>
                  {n.cta}
                </LinkButton>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
