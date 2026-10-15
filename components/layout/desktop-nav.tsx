'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { navIconFor } from '@/components/layout/nav-icons'
import { parsePath } from '@/lib/i18n/config'
import { linkAttrs, type NavItem } from '@/lib/navigation'
import { cn } from '@/lib/utils'

type Indicator = { left: number; width: number } | null

export function DesktopNav({ items, label, className }: { items: NavItem[]; label: string; className?: string }) {
  const current = parsePath(usePathname()).page
  const listRef = useRef<HTMLUListElement>(null)
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [hovered, setHovered] = useState<string | null>(null)
  const [indicator, setIndicator] = useState<Indicator>(null)

  const activeId = items.find((item) => item.key === current)?.id ?? null
  const target = hovered ?? activeId

  const measure = useCallback(() => {
    const link = target ? linkRefs.current[target] : null
    const item = link?.parentElement
    setIndicator(item ? { left: item.offsetLeft, width: item.offsetWidth } : null)
  }, [target])

  useLayoutEffect(measure, [measure])

  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  return (
    <nav aria-label={label} className={className}>
      <ul
        ref={listRef}
        onMouseLeave={() => setHovered(null)}
        className="relative flex items-center gap-0.5 rounded-full border border-brand-gold/30 bg-white/[0.05] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_30px_-18px_rgba(0,0,0,0.8)] backdrop-blur-md 2xl:gap-1 2xl:p-2"
      >
        <span
          aria-hidden
          style={indicator ? { transform: `translateX(${indicator.left}px)`, width: indicator.width } : undefined}
          className={cn(
            'pointer-events-none absolute inset-y-1.5 left-0 rounded-full 2xl:inset-y-2 bg-brand-gold transition-[transform,width,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
            indicator ? 'opacity-100' : 'opacity-0',
          )}
        />
        {items.map((item) => {
          const active = item.id === activeId
          const lit = item.id === target
          const Icon = navIconFor(item)
          return (
            <li key={item.id} className="relative">
              <Link
                ref={(node) => {
                  linkRefs.current[item.id] = node
                }}
                href={item.href}
                {...linkAttrs(item)}
                aria-current={active ? 'page' : undefined}
                onMouseEnter={() => setHovered(item.id)}
                onFocus={() => setHovered(item.id)}
                onBlur={() => setHovered(null)}
                className={cn(
                  'relative z-10 flex h-10 items-center whitespace-nowrap rounded-full px-3.5 font-display text-[0.66rem] font-medium uppercase tracking-[0.1em] transition-colors duration-300 2xl:h-11 2xl:px-4 2xl:text-[0.7rem]',
                  lit ? 'text-brand-ink' : 'text-foreground/80',
                )}
              >
                <Icon aria-hidden className="mr-1.5 hidden size-3.5 shrink-0 xl:block" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
