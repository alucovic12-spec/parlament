import Image from 'next/image'
import { cn } from '@/lib/utils'

export type LogoTone = 'light' | 'ink'

const LOGO_WIDTH = 1437
const LOGO_HEIGHT = 268
/** The logo is 5.36 times wider than tall, so 1.3em of height gives roughly 7em of width. */
const HEIGHT_EM = 1.3

type ParlamentLogoProps = {
  /** `light` is the official warm white; `ink` renders it solid black for light backgrounds. */
  tone?: LogoTone
  priority?: boolean
  /** The logo scales with the font size of this element, so size it with a `text-*` class. */
  className?: string
}

/** The official PARLAMENT people's bar logo. */
export function ParlamentLogo({ tone = 'light', priority = false, className }: ParlamentLogoProps) {
  return (
    <Image
      src="/brand/parlament-logo.png"
      alt="Parlament People\u2019s Bar"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      sizes="(min-width: 1024px) 240px, 180px"
      style={{ height: `${HEIGHT_EM}em`, width: 'auto' }}
      className={cn('inline-block shrink-0 select-none', tone === 'ink' && 'brightness-0', className)}
    />
  )
}
