import { ArrowUpRight, Wine } from 'lucide-react'
import { CmsImage as Image } from '@/components/shared/cms-image'
import Link from 'next/link'
import { LinkButton } from '@/components/shared/link-button'
import { Reveal } from '@/components/shared/reveal'
import { Section, SectionHeading } from '@/components/shared/section'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'

type OfferProps = { locale: Locale; m: Messages; images: (string | null)[]; categories: (string | null)[] }

export function Offer({ locale, m, images, categories }: OfferProps) {
  const o = m.home.offer
  const menuPath = localizedPath(locale, 'menu')

  return (
    <Section labelledBy="offer-title" tone="night" sectionClassName="!pt-[33px] !pb-[37px]">
      <Reveal>
        <SectionHeading id="offer-title" eyebrow={o.eyebrow} title={o.title} intro={o.intro} />
      </Reveal>

      <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
        {o.items.map((item, index) => {
          const category = categories[index]
          return (
            <li
              key={index}
              className="lg:col-span-6 lg:[&:nth-child(4n+1)]:col-span-7 lg:[&:nth-child(4n+2)]:col-span-5 lg:[&:nth-child(4n+3)]:col-span-5 lg:[&:nth-child(4n)]:col-span-7"
            >
              <Link
                href={category ? `${menuPath}#menu-${category}` : menuPath}
                className="glow-card group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="relative h-60 overflow-hidden sm:h-64 lg:h-72">
                  {images[index] ? (
                    <Image
                      src={images[index]}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover brightness-[0.88] saturate-[0.9] motion-safe:transition-all motion-safe:duration-1000 motion-safe:ease-out group-hover:scale-[1.06] group-hover:brightness-100 group-hover:saturate-100"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-brand-green text-brand-ink">
                      <Wine aria-hidden className="size-16" strokeWidth={1.5} />
                    </div>
                  )}
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-card to-transparent" />
                  <span
                    aria-hidden
                    className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-full border border-brand-cream/25 bg-brand-ink/60 font-display text-sm font-medium text-brand-cream backdrop-blur-xl motion-safe:transition-colors motion-safe:duration-300 group-hover:border-brand-green group-hover:bg-brand-green group-hover:text-brand-ink"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6 pt-2 sm:p-7 sm:pt-3">
                  <h3 className="max-w-[16ch] font-display text-2xl font-normal leading-[1.1] tracking-[-0.03em] text-foreground sm:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base font-light leading-relaxed text-muted-foreground">{item.text}</p>

                  <span className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-5 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground motion-safe:transition-colors motion-safe:duration-300 group-hover:text-foreground">
                    <span className="mt-0">{o.cardCta}</span>
                    <span
                      aria-hidden
                      className="flex size-10 items-center justify-center rounded-full border border-border text-foreground motion-safe:transition-all motion-safe:duration-300 group-hover:border-brand-green group-hover:bg-brand-green group-hover:text-brand-ink motion-safe:group-hover:rotate-45"
                    >
                      <ArrowUpRight className="size-4" />
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-12">
        <LinkButton href={menuPath}>{o.cta}</LinkButton>
      </div>
    </Section>
  )
}
