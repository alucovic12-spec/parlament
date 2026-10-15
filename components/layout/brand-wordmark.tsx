import Link from 'next/link'
import { ParlamentLogo } from '@/components/brand/parlament-logo'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

type BrandWordmarkProps = {
  locale: Locale
  priority?: boolean
  className?: string
  logoClassName?: string
}

export function BrandWordmark({ locale, priority = false, className, logoClassName }: BrandWordmarkProps) {
  return (
    <Link
      href={localizedPath(locale, 'home')}
      aria-label={site.name}
      className={cn('group inline-flex min-h-11 items-center', className)}
    >
      <ParlamentLogo
        priority={priority}
        className={cn('text-[1.5rem] motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]', logoClassName)}
      />
    </Link>
  )
}
