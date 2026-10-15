'use client'

import { Ellipsis, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { navIconFor } from '@/components/layout/nav-icons'
import { parsePath, type Locale } from '@/lib/i18n/config'
import { linkAttrs, type NavItem } from '@/lib/navigation'
import { cn } from '@/lib/utils'

type MobileNavProps = {
  locale: Locale
  primary: NavItem[]
  more: NavItem[]
  showLanguage?: boolean
  labels: { nav: string; more: string; moreTitle: string; close: string; language: string }
}

const tabClass =
  'group flex h-16 w-full flex-col items-center justify-center gap-0.5 px-1 text-[0.6875rem] font-medium leading-tight transition-colors'

function TabIcon({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'grid h-8 w-14 place-items-center rounded-full transition-colors duration-300',
        active ? 'bg-primary/15 text-primary' : 'text-muted-foreground group-hover:text-foreground',
      )}
    >
      {children}
    </span>
  )
}

export function MobileNav({ locale, primary, more, showLanguage = true, labels }: MobileNavProps) {
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
        className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-gold/25 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_32px_-18px_rgba(0,0,0,0.6)] backdrop-blur-xl xl:hidden"
      >
        <ul className="mx-auto flex max-w-xl items-stretch justify-around">
          {primary.map((item) => {
            const Icon = navIconFor(item)
            const active = item.key === current
            return (
              <li key={item.id} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  {...linkAttrs(item)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(tabClass, active ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
                >
                  <TabIcon active={active}>
                    <Icon aria-hidden className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                  </TabIcon>
                  <span className="max-w-full truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
          <li className="min-w-0 flex-1">
            <button
              type="button"
              onClick={openSheet}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={cn(tabClass, moreActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
            >
              <TabIcon active={moreActive || open}>
                <Ellipsis aria-hidden className="size-5" />
              </TabIcon>
              <span className="max-w-full truncate">{labels.more}</span>
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
        className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85svh] w-full max-w-none overflow-y-auto rounded-t-3xl border-t border-brand-gold/30 bg-card p-0 text-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm xl:hidden"
      >
        <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3">
          <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">{labels.moreTitle}</h2>
            <button
              type="button"
              onClick={closeSheet}
              aria-label={labels.close}
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-3">
            {more.map((item) => {
              const Icon = navIconFor(item)
              const active = item.key === current
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    {...linkAttrs(item)}
                    onClick={closeSheet}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-full min-h-24 flex-col items-start justify-between gap-3 rounded-2xl border p-4 text-sm font-medium transition-colors',
                      active
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border bg-background/40 text-foreground hover:border-brand-gold/50 hover:bg-muted/50',
                    )}
                  >
                    <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-primary">
                      <Icon aria-hidden className="size-[1.125rem]" />
                    </span>
                    <span className="leading-snug">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {showLanguage ? (
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">{labels.language}</span>
              <LanguageSwitcher locale={locale} label={labels.language} />
            </div>
          ) : null}
        </div>
      </dialog>
    </>
  )
}
