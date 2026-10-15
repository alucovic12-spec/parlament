import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { BrandWordmark } from '@/components/layout/brand-wordmark'
import { DesktopNav } from '@/components/layout/desktop-nav'
import { HeaderShell } from '@/components/layout/header-shell'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import type { HeaderConfig } from '@/lib/content/links'
import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { linkAttrs } from '@/lib/navigation'

type SiteHeaderProps = { locale: Locale; m: Messages; config: HeaderConfig }

export function SiteHeader({ locale, m, config }: SiteHeaderProps) {
  const { announcement, cta, desktopItems } = config
  const bannerClass =
    'tone-ink block bg-brand-gold px-4 py-2 text-center text-xs font-medium tracking-wide text-brand-ink'

  return (
    <>
      {announcement ? (
        announcement.link ? (
          <Link
            href={announcement.link.href}
            {...linkAttrs(announcement.link)}
            className={`${bannerClass} transition-colors hover:bg-brand-sun`}
          >
            {announcement.text}
          </Link>
        ) : (
          <p className={bannerClass}>{announcement.text}</p>
        )
      ) : null}
    <HeaderShell className={`tone-ink ${config.sticky ? 'sticky top-0' : 'relative'} z-30`}>
      <div
        className={[
          'relative bg-brand-ink transition-[background-color,box-shadow,backdrop-filter] duration-500',
          'group-data-[scrolled=true]/header:bg-brand-ink/92 group-data-[scrolled=true]/header:backdrop-blur-xl',
          'group-data-[scrolled=true]/header:shadow-[0_20px_44px_-22px_rgba(0,0,0,0.9)]',
        ].join(' ')}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-brand-cream/10"
        />
        <div className="relative mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 2xl:gap-6 sm:h-[4.5rem] sm:px-6 lg:px-8 xl:h-24">
          <BrandWordmark
            locale={locale}
            priority
            logo={config.logo}
            className="origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[scrolled=true]/header:scale-[0.88]"
            logoClassName="text-[1.3rem] min-[420px]:text-[1.5rem] sm:text-[1.7rem] xl:text-[1.7rem] 2xl:text-[2rem]"
          />

          {desktopItems.length > 0 ? (
            <DesktopNav items={desktopItems} label={m.nav.primaryLabel} className="hidden xl:block" />
          ) : null}

          <div className="flex items-center gap-3">
            {config.showLanguageSwitcher ? (
              <>
                <LanguageSwitcher locale={locale} label={m.nav.language} className="border-brand-gold/30 lg:hidden" />
                <LanguageSwitcher
                  locale={locale}
                  label={m.nav.language}
                  compact
                  className="hidden border-brand-gold/30 bg-white/[0.04] backdrop-blur-md transition-colors hover:border-brand-gold/70 lg:inline-flex"
                />
              </>
            ) : null}
            {cta ? (
            <Link
              href={cta.href}
              {...linkAttrs(cta)}
              className="group/cta relative hidden h-11 items-center gap-3 overflow-hidden rounded-full border border-brand-sun/40 bg-brand-sun shadow-none pl-5 pr-1.5 xl:pl-5 2xl:pl-7 font-display text-[0.68rem] font-medium uppercase tracking-[0.16em] text-brand-ink transition-[background-color,box-shadow,transform] duration-300 hover:bg-brand-cream hover:shadow-[0_10px_30px_-14px_rgba(0,0,0,0.55)] motion-safe:hover:-translate-y-0.5 sm:inline-flex 2xl:h-12 2xl:pl-7 2xl:text-[0.74rem]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-300 group-hover/cta:bg-white/10"
              />
              <span className="relative">{cta.label}</span>
              <span className="relative grid size-8 place-items-center rounded-full bg-brand-ink text-brand-gold transition-colors duration-300 group-hover/cta:text-brand-cream 2xl:size-9">
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 motion-safe:group-hover/cta:-translate-y-0.5 motion-safe:group-hover/cta:translate-x-0.5"
                />
              </span>
            </Link>
            ) : null}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px bg-brand-gold/20" />
        <div
          aria-hidden
          style={{ transform: 'scaleX(var(--scroll-progress, 0))' }}
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand-sun"
        />
      </div>
    </HeaderShell>
    </>
  )
}
