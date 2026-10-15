'use client'

import { useActionState, useEffect, useState } from 'react'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { submitReservation } from '@/lib/reservations/actions'
import {
  maxDaysAhead,
  maxOnlinePartySize,
  occasions,
  reservationSlots,
  reservationTimeZone,
} from '@/lib/reservations/config'
import {
  initialReservationState,
  type ReservationFieldName,
  type ReservationState,
} from '@/lib/reservations/types'
import { cn } from '@/lib/utils'

type Props = { locale: Locale; labels: Messages['reservations'] }

const fieldClass =
  'mt-2 block w-full rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 aria-[invalid=true]:border-destructive'

function zagrebToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: reservationTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatDate(isoDate: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'hr' ? 'hr-HR' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`))
}

export function ReservationForm(props: Props) {
  const [attempt, setAttempt] = useState(0)
  return <ReservationFormInner key={attempt} {...props} onReset={() => setAttempt((value) => value + 1)} />
}

function ReservationFormInner({ locale, labels, onReset }: Props & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState<ReservationState, FormData>(
    submitReservation,
    initialReservationState,
  )
  const [idempotencyKey, setIdempotencyKey] = useState('')
  const [bounds, setBounds] = useState<{ min: string; max: string } | null>(null)

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID())
    const today = zagrebToday()
    setBounds({ min: today, max: addDays(today, maxDaysAhead) })
  }, [])

  if (state.status === 'success') {
    const { summary } = state
    return (
      <div
        role="status"
        className="tone-green rounded-3xl p-8 sm:p-10"
      >
        <CheckCircle2 aria-hidden className="size-10 text-primary" />
        <h2 className="mt-4 font-display text-3xl sm:text-4xl">{labels.success.title}</h2>
        <p className="mt-3 max-w-xl text-pretty text-muted-foreground">{labels.success.text}</p>
        {summary.date ? (
          <dl className="mt-6 rounded-xl border border-border bg-background/40 p-5">
            <dt className="text-xs uppercase tracking-[0.2em] text-primary">
              {labels.success.summaryLabel}
            </dt>
            <dd className="mt-2 text-lg capitalize">{formatDate(summary.date, locale)}</dd>
            <dd className="text-muted-foreground">
              {summary.time} · {summary.partySize} {labels.success.guests}
            </dd>
          </dl>
        ) : null}
        <Button type="button" variant="outline" onClick={onReset} className="mt-8">
          {labels.success.newRequest}
        </Button>
      </div>
    )
  }

  const errors = labels.errors as Record<string, string>
  const fieldErrors = state.status === 'error' ? state.fieldErrors : {}
  const values = state.status === 'error' ? state.values : {}
  const formError = state.status === 'error' ? state.formError : undefined

  function errorFor(field: ReservationFieldName) {
    const code = fieldErrors[field]
    return code ? (errors[code] ?? errors[field]) : undefined
  }

  function describedBy(field: ReservationFieldName, hintId?: string) {
    return [errorFor(field) ? `${field}-error` : null, hintId ?? null].filter(Boolean).join(' ') || undefined
  }

  function FieldError({ field }: { field: ReservationFieldName }) {
    const message = errorFor(field)
    if (!message) return null
    return (
      <p id={`${field}-error`} className="mt-1.5 text-sm text-destructive">
        {message}
      </p>
    )
  }

  return (
    <form action={formAction} noValidate className="interior-panel p-6 sm:p-8">
      <h2 className="font-display text-3xl">{labels.formTitle}</h2>

      {formError ? (
        <p role="alert" className="mt-5 rounded-xl border border-destructive/50 px-4 py-3 text-sm text-destructive">
          {errors[formError]}
        </p>
      ) : null}

      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            {labels.fields.fullName}
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            defaultValue={values.fullName}
            aria-invalid={Boolean(errorFor('fullName'))}
            aria-describedby={describedBy('fullName')}
            className={fieldClass}
          />
          <FieldError field="fullName" />
        </div>

        <div>
          <label htmlFor="phone" className="text-sm font-medium">
            {labels.fields.phone}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            maxLength={30}
            defaultValue={values.phone}
            aria-invalid={Boolean(errorFor('phone'))}
            aria-describedby={describedBy('phone')}
            className={fieldClass}
          />
          <FieldError field="phone" />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium">
            {labels.fields.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            defaultValue={values.email}
            aria-invalid={Boolean(errorFor('email'))}
            aria-describedby={describedBy('email')}
            className={fieldClass}
          />
          <FieldError field="email" />
        </div>

        <div>
          <label htmlFor="date" className="text-sm font-medium">
            {labels.fields.date}
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            min={bounds?.min}
            max={bounds?.max}
            defaultValue={values.date}
            aria-invalid={Boolean(errorFor('date'))}
            aria-describedby={describedBy('date')}
            className={fieldClass}
          />
          <FieldError field="date" />
        </div>

        <div>
          <label htmlFor="time" className="text-sm font-medium">
            {labels.fields.time}
          </label>
          <select
            id="time"
            name="time"
            required
            defaultValue={values.time ?? ''}
            aria-invalid={Boolean(errorFor('time'))}
            aria-describedby={describedBy('time')}
            className={fieldClass}
          >
            <option value="" disabled>
              {labels.fields.timePlaceholder}
            </option>
            {reservationSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          <FieldError field="time" />
        </div>

        <div>
          <label htmlFor="partySize" className="text-sm font-medium">
            {labels.fields.partySize}
          </label>
          <select
            id="partySize"
            name="partySize"
            required
            defaultValue={values.partySize ?? '2'}
            aria-invalid={Boolean(errorFor('partySize'))}
            aria-describedby={describedBy('partySize', 'party-hint')}
            className={fieldClass}
          >
            {Array.from({ length: maxOnlinePartySize }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
          <p id="party-hint" className="mt-1.5 text-xs text-muted-foreground">
            {labels.largeGroup}
          </p>
          <FieldError field="partySize" />
        </div>

        <div>
          <label htmlFor="occasion" className="text-sm font-medium">
            {labels.fields.occasion}
          </label>
          <select
            id="occasion"
            name="occasion"
            defaultValue={values.occasion ?? 'casual'}
            aria-invalid={Boolean(errorFor('occasion'))}
            aria-describedby={describedBy('occasion')}
            className={fieldClass}
          >
            {occasions.map((occasion) => (
              <option key={occasion} value={occasion}>
                {labels.occasions[occasion]}
              </option>
            ))}
          </select>
          <FieldError field="occasion" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium">
            {labels.fields.notes}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={500}
            placeholder={labels.fields.notesHint}
            defaultValue={values.notes}
            aria-invalid={Boolean(errorFor('notes'))}
            aria-describedby={describedBy('notes')}
            className={cn(fieldClass, 'resize-y')}
          />
          <FieldError field="notes" />
        </div>
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            name="consent"
            required
            defaultChecked={values.consent === 'on'}
            aria-invalid={Boolean(errorFor('consent'))}
            aria-describedby={describedBy('consent')}
            className="mt-1 size-4 shrink-0 accent-primary"
          />
          <span>{labels.consent}</span>
        </label>
        <FieldError field="consent" />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="mt-8 w-full sm:w-auto">
        {pending ? (
          <>
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
            {labels.submitting}
          </>
        ) : (
          labels.submit
        )}
      </Button>
    </form>
  )
}
