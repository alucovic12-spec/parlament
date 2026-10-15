'use client'

import { usePathname } from 'next/navigation'
import { LinkButton } from '@/components/shared/link-button'
import { localizedPath, parsePath } from '@/lib/i18n/config'
import { en } from '@/lib/i18n/messages/en'
import { hr } from '@/lib/i18n/messages/hr'

export default function NotFound() {
  const locale = parsePath(usePathname()).locale
  const text = (locale === 'en' ? en : hr).notFound

  return (
    <div className="mx-auto flex min-h-[60svh] max-w-3xl flex-col items-start justify-center px-4 py-24 sm:px-6">
      <p className="text-xs uppercase tracking-[0.28em] text-primary">404</p>
      <h1 className="mt-3 text-balance font-display text-3xl leading-tight sm:text-5xl">{text.title}</h1>
      <p className="mt-5 max-w-xl text-lg text-muted-foreground">{text.text}</p>
      <LinkButton href={localizedPath(locale, 'home')} variant="outline" className="mt-8">
        {text.back}
      </LinkButton>
    </div>
  )
}
