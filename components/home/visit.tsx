import { Clock, Mail, MapPin, Phone, Share2 } from 'lucide-react'
import { LinkButton } from '@/components/shared/link-button'
import { Reveal } from '@/components/shared/reveal'
import { Section, SectionHeading } from '@/components/shared/section'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { getSiteSettings } from '@/lib/content/site-content'

const iconBox =
  'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-foreground/15 bg-background/60 text-eyebrow transition-colors duration-300 group-hover:border-brand-green group-hover:bg-brand-green'

export async function Visit({ locale, m }: { locale: Locale; m: Messages }) {
  const v = m.home.visit
  const settings = await getSiteSettings(locale)
  const socials = Object.entries(settings.social).filter((entry): entry is [string, string] => Boolean(entry[1]))

  const rows = [
    { icon: MapPin, label: v.address, value: settings.contact.address, pending: v.addressPending },
    { icon: Clock, label: v.hours, value: settings.contact.hours, pending: v.hoursPending },
    { icon: Phone, label: v.phone, value: settings.contact.phone, pending: v.phonePending },
    { icon: Mail, label: v.email, value: settings.contact.email, pending: v.emailPending },
  ]

  return (
    <Section labelledBy="visit-title" tone="sand">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="min-w-0">
          <SectionHeading id="visit-title" eyebrow={v.eyebrow} title={v.title} />
          <dl className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rows.map(({ icon: Icon, label, value, pending }) => (
              <div key={label} className="group flex min-h-28 gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30">
                <span className={iconBox}>
                  <Icon aria-hidden className="size-4" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</dt>
                  <dd className={value ? 'mt-1 whitespace-pre-line text-lg' : 'mt-1 text-lg text-muted-foreground'}>
                    {value && Icon === Mail ? (
                      <a href={`mailto:${value}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                        {value}
                      </a>
                    ) : (
                      (value ?? pending)
                    )}
                  </dd>
                </div>
              </div>
            ))}
            <div className="group flex min-h-28 gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30">
              <span className={iconBox}>
                <Share2 aria-hidden className="size-4" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{v.social}</dt>
                <dd className="mt-1 text-lg">
                  {socials.length > 0 ? (
                    <ul className="flex flex-wrap gap-x-5">
                      {socials.map(([name, url]) => (
                        <li key={name}>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center capitalize underline-offset-4 hover:underline">
                            {name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">{v.socialPending}</span>
                  )}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <LinkButton href={localizedPath(locale, 'reservations')}>{v.reserve}</LinkButton>
            <LinkButton href={localizedPath(locale, 'contact')} variant="outline">
              {v.contact}
            </LinkButton>
          </div>
        </Reveal>

        <Reveal className="min-w-0">
          <div
            role="img"
            aria-label={v.addressPending}
            className="tone-ink glow-card group relative flex aspect-[4/3] h-full min-h-72 w-full items-center justify-center overflow-hidden rounded-[2.5rem] border border-border bg-brand-anthracite"
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--brand-green)_16%,transparent),transparent_65%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100"
            />
            <span className="relative flex size-20 items-center justify-center rounded-full bg-brand-green text-brand-ink motion-safe:transition-transform motion-safe:duration-500 group-hover:-translate-y-1">
              <MapPin aria-hidden className="size-9" />
            </span>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
