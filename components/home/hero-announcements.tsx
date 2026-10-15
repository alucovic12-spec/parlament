import { ArrowUpRight } from 'lucide-react'
import { CmsImage as Image } from '@/components/shared/cms-image'
import Link from 'next/link'
import type { LocalizedEvent } from '@/lib/events/types'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'

type Props = { locale: Locale; m: Messages; events: LocalizedEvent[] }

function dayAndMonth(iso: string) {
  const parts = new Intl.DateTimeFormat('hr-HR', {
    timeZone: 'Europe/Zagreb',
    day: '2-digit',
    month: '2-digit',
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return { day: get('day'), month: get('month') }
}

export function HeroAnnouncements({ locale, m, events }: Props) {
  if (events.length === 0) return null

  const heading = locale === 'hr' ? 'Nadolazeći program' : 'Upcoming programme'

  return (
    <div style={{ animationDelay: '560ms' }} className="fade-up mt-12 lg:mt-10">
      <div className="mb-4 flex items-center gap-4">
        <h2 className="text-xs uppercase tracking-[0.28em] text-brand-gold">{heading}</h2>
        <span aria-hidden className="h-px flex-1 bg-brand-cream/20" />
        <Link
          href={localizedPath(locale, 'events')}
          className="text-xs uppercase tracking-wider text-brand-cream/80 underline-offset-4 hover:text-brand-gold hover:underline"
        >
          {m.home.hero.viewEvents}
        </Link>
      </div>

      <ul className="grid gap-3 md:grid-cols-3">
        {events.map((event) => {
          const { day, month } = dayAndMonth(event.start)
          return (
            <li key={event.id}>
              <Link
                href={localizedPath(locale, 'events', [event.id])}
                className="group relative flex h-full overflow-hidden glow-card rounded-2xl border border-brand-cream/15 bg-brand-ink/65 backdrop-blur-xl transition-all hover:border-brand-green/60 focus-visible:border-brand-green"
              >
                <span className="relative block w-28 shrink-0 overflow-hidden sm:w-36">
                  {event.image ? (
                    <Image
                      src={event.image}
                      alt=""
                      fill
                      sizes="144px"
                      className="object-contain motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-110"
                    />
                  ) : null}
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-ink/60" />
                </span>

                <span className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
                  <span className="flex items-start justify-between gap-3">
                    <time dateTime={event.start} className="font-display text-3xl leading-none text-brand-cream sm:text-4xl">
                      {day}.{month}.
                    </time>
                    <span className="rounded-full border border-brand-green/40 bg-brand-green/10 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-brand-green">
                      {m.events.types[event.type]}
                    </span>
                  </span>

                  <span className="block">
                    <span className="block max-w-[18ch] text-balance font-display text-lg font-medium leading-snug tracking-[-0.025em] text-brand-cream sm:text-xl">{event.title}</span>
                    <span className="mt-2 flex items-center justify-between gap-2 text-xs uppercase tracking-wider text-brand-cream/70">
                      <span className="capitalize">
                        {event.weekday}, {event.timeLabel}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 shrink-0 text-brand-cream/60 motion-safe:transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-gold"
                      />
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
