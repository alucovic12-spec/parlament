import type { Messages } from '@/lib/i18n/messages'

/** Decorative moving strip. The same information is available as text in the offer section. */
export function Ticker({ m }: { m: Messages }) {
  return (
    <div aria-hidden className="tone-green group overflow-hidden border-y border-brand-ink/10">
      <div className="marquee-track flex w-max items-end py-3 group-hover:[animation-play-state:paused] sm:py-4">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center gap-8 pr-8">
            {m.home.ticker.map((word) => (
              <li
                key={word}
                className="font-accent flex items-center gap-8 text-xl font-light uppercase tracking-[0.12em] sm:text-3xl"
              >
                {word}
                <span className="size-1.5 rounded-full bg-brand-ink/35" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
