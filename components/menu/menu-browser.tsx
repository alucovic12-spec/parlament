'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CmsImage } from '@/components/shared/cms-image'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import type { LocalizedMenuCategory, LocalizedMenuItem, MenuCategoryId } from '@/lib/menu/types'
import { cn } from '@/lib/utils'
import { MenuItemCard } from './menu-item-card'

type Props = {
  locale: Locale
  labels: Messages['menu']
  categories: LocalizedMenuCategory[]
  items: LocalizedMenuItem[]
}

type ActiveCategory = 'all' | MenuCategoryId

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
    .trim()

export function MenuBrowser({ locale, labels, categories, items }: Props) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<ActiveCategory>('all')

  useEffect(() => {
    const applyHash = () => {
      const match = window.location.hash.match(/^#menu-(.+)$/)
      if (!match) return
      const id = decodeURIComponent(match[1])
      if (!categories.some((category) => category.id === id)) return
      setQuery('')
      setActive(id)
      requestAnimationFrame(() => document.getElementById(`menu-${id}`)?.scrollIntoView({ block: 'start' }))
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [categories])

  const formatPrice = useMemo(() => {
    const formatter = new Intl.NumberFormat(locale === 'hr' ? 'hr-HR' : 'en-IE', {
      style: 'currency',
      currency: 'EUR',
    })
    return (value: number) => formatter.format(value)
  }, [locale])

  const parentById = useMemo(() => new Map(categories.map((category) => [category.id, category.parentId])), [categories])
  const topCategories = useMemo(() => categories.filter((category) => !category.parentId), [categories])
  const activeTop = active === 'all' ? undefined : parentById.get(active) ?? active
  const subCategories = useMemo(
    () => (activeTop ? categories.filter((category) => category.parentId === activeTop) : []),
    [categories, activeTop],
  )

  const groups = useMemo(() => {
    const needle = normalize(query)
    const matches = items.filter((item) => {
      if (active !== 'all' && item.category !== active && parentById.get(item.category) !== active) return false
      if (!needle) return true
      return normalize(`${item.name} ${item.description ?? ''}`).includes(needle)
    })
    return categories
      .map((category) => ({ category, items: matches.filter((item) => item.category === category.id) }))
      .filter((group) => group.items.length > 0)
  }, [items, categories, query, active, parentById])

  const total = groups.reduce((sum, group) => sum + group.items.length, 0)
  const isFiltered = query !== '' || active !== 'all'

  function reset() {
    setQuery('')
    setActive('all')
  }

  return (
    <div>
      <div className="sticky top-16 z-20 sm:top-[4.5rem] xl:top-24 border-b border-border bg-background/92 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="relative">
            <label htmlFor="menu-search" className="sr-only">
              {labels.searchLabel}
            </label>
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              autoComplete="off"
              className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-12 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={labels.clearSearch}
                className="absolute right-1.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X aria-hidden className="size-4" />
              </button>
            ) : null}
          </div>

          <nav aria-label={labels.categoriesLabel} className="-mx-4 mt-3 sm:-mx-6 lg:-mx-8">
            <ul className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
              {[{ id: 'all' as const, name: labels.all }, ...topCategories].map((category) => {
                const selected = category.id === 'all' ? active === 'all' : activeTop === category.id
                return (
                  <li key={category.id} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setActive(category.id)}
                      className={cn(
                        'flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        selected
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-card text-foreground/70 hover:border-foreground/40 hover:bg-accent hover:text-foreground',
                      )}
                    >
                      {category.name}
                    </button>
                  </li>
                )
              })}
            </ul>
            {subCategories.length > 0 && activeTop ? (
              <ul className="mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
                {[{ id: activeTop, name: labels.all }, ...subCategories].map((category, index) => {
                  const selected = active === category.id
                  return (
                    <li key={`${category.id}-${index}`} className="shrink-0">
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setActive(category.id)}
                        className={cn(
                          'flex min-h-10 items-center rounded-full border px-3.5 text-[0.8125rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          selected
                            ? 'border-primary bg-primary/15 text-foreground'
                            : 'border-border text-foreground/65 hover:border-foreground/40 hover:text-foreground',
                        )}
                      >
                        {category.name}
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {labels.results.replace('{count}', String(total))}
        </p>

        {groups.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-foreground/25 p-10 text-center">
            <h2 className="font-display text-3xl">{labels.noResultsTitle}</h2>
            <p className="mt-2 text-muted-foreground">{labels.noResultsText}</p>
            {isFiltered ? (
              <Button type="button" variant="outline" onClick={reset} className="mt-6 min-h-11">
                {labels.resetFilters}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 space-y-9">
            {groups.map(({ category, items: groupItems }) => (
              <section key={category.id} aria-labelledby={`menu-${category.id}`}>
                {category.image ? (
                  <div className="relative mb-3 h-24 w-full overflow-hidden rounded-xl border border-border sm:h-28">
                    <CmsImage
                      src={category.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 64rem, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                {category.parentId ? (
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {categories.find((parent) => parent.id === category.parentId)?.name}
                  </p>
                ) : null}
                <h2
                  id={`menu-${category.id}`}
                  className={cn(
                    'scroll-mt-52 font-display font-normal tracking-[-0.035em] text-foreground xl:scroll-mt-60',
                    category.parentId ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl',
                  )}
                >
                  {category.name}
                </h2>
                <ul className="mt-2 grid gap-x-10 md:grid-cols-2">
                  {groupItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} labels={labels} formatPrice={formatPrice} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
