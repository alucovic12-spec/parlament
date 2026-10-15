'use client'

import { CalendarPlus, Download, Share2 } from 'lucide-react'
import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  id: string
  title: string
  description: string
  start: string
  end: string
  location: string
  labels: {
    share: string
    shareCopied: string
    googleCalendar: string
    downloadIcs: string
    calendarLabel: string
  }
}

const actionClass = cn(
  buttonVariants({ variant: 'outline' }),
  'h-12 min-w-11 rounded-full border-primary/60 bg-transparent px-5 text-sm  hover:bg-primary/10',
)

const toCalendarDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '')
const escapeIcs = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

export function EventActions({ id, title, description, start, end, location, labels }: Props) {
  const [copied, setCopied] = useState(false)

  const googleUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toCalendarDate(start)}/${toCalendarDate(end)}`,
    details: description,
    location,
  }).toString()}`

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // The user dismissed the share sheet.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  function downloadIcs() {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Parlament//Events//HR',
      'BEGIN:VEVENT',
      `UID:${id}@parlament`,
      `DTSTAMP:${toCalendarDate(new Date().toISOString())}`,
      `DTSTART:${toCalendarDate(start)}`,
      `DTEND:${toCalendarDate(end)}`,
      `SUMMARY:${escapeIcs(title)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `LOCATION:${escapeIcs(location)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${id}.ics`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{labels.calendarLabel}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={actionClass}>
          <CalendarPlus aria-hidden className="mr-2 size-4" />
          {labels.googleCalendar}
          <span className="sr-only"> (new tab)</span>
        </a>
        <button type="button" onClick={downloadIcs} className={actionClass}>
          <Download aria-hidden className="mr-2 size-4" />
          {labels.downloadIcs}
        </button>
        <button type="button" onClick={share} className={actionClass}>
          <Share2 aria-hidden className="mr-2 size-4" />
          {labels.share}
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-primary">
        {copied ? labels.shareCopied : ''}
      </p>
    </div>
  )
}
