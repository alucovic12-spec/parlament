'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { localeCookie, locales, switchLocalePath, type Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utils'

type LanguageSwitcherProps = { locale: Locale; label: string; className?: string; compact?: boolean }

export function LanguageSwitcher({ locale, label, className, compact = false }: LanguageSwitcherProps) {
  const pathname = usePathname()

  const remember = (target: Locale) => {
    document.cookie = `${localeCookie}=${target}; path=/; max-age=31536000; samesite=lax`
  }

  return (
    <div role="group" aria-label={label} className={cn('inline-flex items-center rounded-full border border-border p-0.5', className)}>
      {locales.map((target) => {
        const active = target === locale
        return (
          <Link
            key={target}
            href={switchLocalePath(pathname, target)}
            lang={target}
            hrefLang={target}
            aria-current={active ? 'true' : undefined}
            onClick={() => remember(target)}
            className={cn(
              'flex items-center justify-center rounded-full uppercase transition-colors',
              compact ? 'h-6 min-w-9 px-2 text-[0.62rem] tracking-[0.2em]' : 'h-10 min-w-11 px-3 text-xs tracking-widest',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {target}
          </Link>
        )
      })}
    </div>
  )
}
