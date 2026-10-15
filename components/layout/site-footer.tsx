import Link from 'next/link'
import { BrandWordmark } from '@/components/layout/brand-wordmark'
import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import type { NavItem } from '@/lib/navigation'
import { site } from '@/lib/site'

type SiteFooterProps = { locale: Locale; m: Messages; items: NavItem[] }

export function SiteFooter({ locale, m, items }: SiteFooterProps) {
  const v = m.home.visit
  const socials = Object.entries(site.social).filter((entry): entry is [string, string] => Boolean(entry[1]))

  return (
    <footer className="tone-ink relative overflow-hidden border-t border-brand-cream/10">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-[42px] sm:px-6 md:grid-cols-[1.4fr_0.8fr_1fr] lg:px-8">
        <div>
          <BrandWordmark locale={locale} variant="stacked" logoClassName="text-[1.75rem]" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">{m.home.hero.text}</p>
        </div>

        <nav aria-label={m.footer.explore}>
          <h2 className="text-xs uppercase tracking-[0.22em] text-primary">{m.footer.explore}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 md:grid-cols-1">
            {items.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="flex min-h-11 items-center text-sm text-brand-cream/65 transition-all hover:translate-x-1 hover:text-brand-cream">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs uppercase tracking-[0.22em] text-primary">{m.footer.visit}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="sr-only">{v.address}</dt>
              <dd className={site.contact.address ? '' : 'text-muted-foreground'}>{site.contact.address ?? v.addressPending}</dd>
            </div>
            <div>
              <dt className="sr-only">{v.phone}</dt>
              <dd className={site.contact.phone ? '' : 'text-muted-foreground'}>{site.contact.phone ?? v.phonePending}</dd>
            </div>
            <div>
              <dt className="sr-only">{v.email}</dt>
              <dd className={site.contact.email ? '' : 'text-muted-foreground'}>
                {site.contact.email ? (
                  <a href={`mailto:${site.contact.email}`} className="inline-flex min-h-11 items-center hover:text-primary">
                    {site.contact.email}
                  </a>
                ) : (
                  v.emailPending
                )}
              </dd>
            </div>
          </dl>
          {socials.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-4 text-sm">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} rel="noopener noreferrer" target="_blank" className="flex min-h-11 items-center capitalize hover:text-primary">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {site.name}. {m.footer.rights}
        </p>
      </div>
    </footer>
  )
}
