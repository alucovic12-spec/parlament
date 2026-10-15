import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ParlamentLogo } from '@/components/brand/parlament-logo'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import type { HeaderLogo } from '@/lib/navigation'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

type BrandWordmarkProps = {
  locale: Locale
  priority?: boolean
  className?: string
  logoClassName?: string
  logo?: HeaderLogo | null
  compact?: boolean
}

export function BrandWordmark({ locale, priority = false, className, logoClassName, logo, compact = false }: BrandWordmarkProps) {
  return (
    <Link
      href={localizedPath(locale, 'home')}
      aria-label={site.name}
      className={cn('group inline-flex min-h-11 items-center', className)}
    >
      {logo ? (
        <Image
          src={logo.url}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          priority={priority}
          style={{ '--logo-h': `${logo.heightPx}px` } as CSSProperties}
          className={cn(
            'w-auto select-none motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]',
            compact
              ? 'h-[calc(var(--logo-h)*0.7)]'
              : 'h-[calc(var(--logo-h)*0.7)] sm:h-[calc(var(--logo-h)*0.85)] xl:h-[var(--logo-h)]',
          )}
        />
      ) : (
        <ParlamentLogo
          priority={priority}
          className={cn('text-[1.5rem] motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]', logoClassName)}
        />
      )}
    </Link>
  )
}
