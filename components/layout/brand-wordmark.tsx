import Link from 'next/link'
import { ParlamentLogo, type LogoVariant } from '@/components/brand/parlament-logo'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

type BrandWordmarkProps = {
  locale: Locale
  variant?: LogoVariant
  optical?: boolean
  className?: string
  logoClassName?: string
}

export function BrandWordmark({ locale, variant = 'horizontal', optical = false, className, logoClassName }: BrandWordmarkProps) {
  return (
    <Link
      href={localizedPath(locale, 'home')}
      aria-label={site.name}
      className={cn('group inline-flex min-h-11 items-center', className)}
    >
      <ParlamentLogo
        variant={variant}
        optical={optical}
        className={cn('text-[1.5rem] motion-safe:transition-transform motion-safe:duration-500 group-hover:text-brand-cream', logoClassName)}
      />
    </Link>
  )
}
