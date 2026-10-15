'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { EventType, LocalizedEvent } from '@/lib/events/types'
import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { cn } from '@/lib/utils'
import { EventCard } from './event-card'

type Props = {
  locale: Locale
  labels: Messages['events']
  upcoming: LocalizedEvent[]
  past: LocalizedEvent[]
}

type Tab = 'upcoming' | 'past'
type ActiveType = 'all' | EventType

const chip =
  'flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
const chipOn = 'border-foreground bg-foreground text-background'
const chipOff = 'border-border bg-card text-foreground/70 hover:border-foreground/40 hover:bg-accent hover:text-foreground'

export function EventBrowser({ locale, labels, upcoming, past }: Props) {
  const [tab, setTab] = useState<Tab>('upcoming')
  const [type, setType] = useState<ActiveType>('all')

  const source = tab === 'upcoming' ? upcoming : past
  const availableTypes = useMemo(
    () => Array.from(new Set([...upcoming, ...past].map((event) => event.type))),
    [upcoming, past],
  )
  const activeType = type === 'all' || availableTypes.includes(type) ? type : 'all'
  const visible = activeType === 'all' ? source : source.filter((event) => event.type === activeType)

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <div role="group" aria-label={labels.tabsLabel} className="flex gap-2">
          {(['upcoming', 'past'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
              className={cn(chip, tab === value ? chipOn : chipOff)}
            >
              {labels[value]}
            </button>
          ))}
        </div>

        <div role="group" aria-label={labels.typesLabel} className="-mx-4 sm:-mx-6 lg:-mx-8">
          <ul className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
            {(['all', ...availableTypes] as const).map((value) => (
              <li key={value} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={activeType === value}
                  onClick={() => setType(value)}
                  className={cn(chip, activeType === value ? chipOn : chipOff)}
                >
                  {value === 'all' ? labels.all : labels.types[value]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-sm text-muted-foreground">
        {labels.results.replace('{count}', String(visible.length))}
      </p>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-foreground/25 p-10 text-center">
          <h2 className="font-display text-3xl">
            {tab === 'upcoming' ? labels.emptyUpcomingTitle : labels.emptyPastTitle}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {tab === 'upcoming' ? labels.emptyUpcomingText : labels.emptyPastText}
          </p>
          {activeType !== 'all' ? (
            <Button type="button" variant="outline" onClick={() => setType('all')} className="mt-6 min-h-11">
              {labels.resetFilters}
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {visible.map((event) => (
            <EventCard key={event.id} event={event} locale={locale} labels={labels} />
          ))}
        </ul>
      )}
    </div>
  )
}
