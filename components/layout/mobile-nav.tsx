'use client'

import {
  CalendarCheck,
  CalendarDays,
  Ellipsis,
  House,
  Images,
  MapPin,
  Martini,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { parsePath, type Locale, type PageKey } from '@/lib/i18n/config'
import type { NavItem } from '@/lib/navigation'
import { cn } from '@/lib/utils'

const icons: Record<PageKey, LucideIcon> = {
  home: House,
  menu: Martini,
  events: CalendarDays,
  reservations: CalendarCheck,
  gallery: Images,
  careers: Users,
  contact: MapPin,
}

type MobileNavProps = {
  locale: Locale
  primary: NavItem[]
  more: NavItem[]
  labels: { nav: string; more: string; moreTitle: string; close: string; language: string }
}

export function MobileNav({ locale, primary, more, labels }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const current = parsePath(usePathname()).page
  const moreActive = more.some((item) => item.key === current)

  const openSheet = () => {
    dialogRef.current?.showModal()
    setOpen(true)
  }
  const closeSheet = () => dialogRef.current?.close()

  return (
    <>
      <nav
        aria-label={labels.nav}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur xl:hidden"
      >
        <ul className="mx-auto flex max-w-xl items-stretch justify-around">
          {primary.map((item) => {
            const Icon = icons[item.key]
            const active = item.key === current
            return (
              <li key={item.key} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon aria-hidden className="size-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={openSheet}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={cn(
                'flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors',
                moreActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Ellipsis aria-hidden className="size-5" />
              {labels.more}
            </button>
          </li>
        </ul>
      </nav>

      <dialog
        ref={dialogRef}
        aria-label={labels.moreTitle}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeSheet()
        }}
        className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85svh] w-full max-w-none overflow-y-auto rounded-t-3xl border-t border-border bg-card p-0 text-foreground backdrop:bg-foreground/50 xl:hidden"
      >
        <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">{labels.moreTitle}</h2>
            <button
              type="button"
              onClick={closeSheet}
              aria-label={labels.close}
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>

          <ul className="mt-3 divide-y divide-border">
            {more.map((item) => {
              const Icon = icons[item.key]
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={closeSheet}
                    aria-current={item.key === current ? 'page' : undefined}
                    className={cn(
                      'flex min-h-14 items-center gap-4 text-base font-medium',
                      item.key === current ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    <Icon aria-hidden className="size-5 text-primary" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">{labels.language}</span>
            <LanguageSwitcher locale={locale} label={labels.language} />
          </div>
        </div>
      </dialog>
    </>
  )
}
