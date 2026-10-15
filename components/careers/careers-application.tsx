'use client'

import { useActionState, useEffect, useState, type ReactNode } from 'react'
import { Check, GraduationCap, Sprout, Wine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { submitApplication } from '@/lib/careers/actions'
import { applicationTypes, availabilityOptions, type ApplicationType } from '@/lib/careers/config'
import { initialApplicationState, type ApplicationFieldName } from '@/lib/careers/types'
import { SelectField, TextAreaField, TextField } from './fields'

type Labels = Messages['careersPage']
type Props = { locale: Locale; labels: Labels; aside: ReactNode }

const typeIcons = { experienced: Wine, learner: Sprout, student: GraduationCap } as const
const toOptions = (keys: readonly string[], labels: Record<string, string>) =>
  keys.map((value) => ({ value, label: labels[value] }))

export function CareersApplication({ locale, labels, aside }: Props) {
  const [attempt, setAttempt] = useState(0)
  return (
    <Application
      key={attempt}
      locale={locale}
      labels={labels}
      aside={aside}
      onReset={() => setAttempt((value) => value + 1)}
    />
  )
}

function Application({ locale, labels, aside, onReset }: Props & { onReset: () => void }) {
  const f = labels.form
  const errorText = f.errors as Record<string, string>
  const [state, formAction, pending] = useActionState(submitApplication, initialApplicationState)
  const [type, setType] = useState<ApplicationType | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState('')

  useEffect(() => setIdempotencyKey(crypto.randomUUID()), [])

  if (state.status === 'success') {
    return (
      <div role="status" className="rounded-2xl border border-primary/40 bg-card p-8 text-center sm:p-12">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-display text-3xl">{labels.success.title}</h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">{labels.success.text}</p>
        <Button type="button" variant="outline" className="mt-8" onClick={onReset}>
          {labels.success.again}
        </Button>
      </div>
    )
  }

  const values = state.status === 'error' ? state.values : {}
  const fieldErrors = state.status === 'error' ? state.fieldErrors : {}
  const formError = state.status === 'error' ? state.formError : undefined
  const errorFor = (field: ApplicationFieldName) => {
    const code = fieldErrors[field]
    return code ? (errorText[code] ?? errorText[field]) : undefined
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <section id="application" aria-labelledby="application-title" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">{labels.quick.title}</p>
        <h2 id="application-title" className="mt-2 font-display text-2xl sm:text-3xl">{f.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{labels.quick.text}</p>

        {formError ? (
          <p role="alert" className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm">
            {errorText[formError]}
          </p>
        ) : null}

        <form action={formAction} className="mt-7 flex flex-col gap-5">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] size-px opacity-0" />

          <fieldset aria-describedby={errorFor('type') ? 'type-error' : undefined}>
            <legend className="text-sm font-medium">{f.typeLabel}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {applicationTypes.map((value) => {
                const Icon = typeIcons[value]
                return (
                  <label key={value} className="cursor-pointer">
                    <input type="radio" name="type" value={value} checked={type === value} onChange={() => setType(value)} required className="peer sr-only" />
                    <span className="flex h-full flex-col gap-2 rounded-xl border border-border p-4 text-sm transition-colors hover:border-primary/60 peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                      <Icon className="size-5 text-primary" aria-hidden="true" />
                      <span>{f.types[value]}</span>
                    </span>
                  </label>
                )
              })}
            </div>
            {errorFor('type') ? <p id="type-error" className="mt-1.5 text-sm text-destructive">{errorFor('type')}</p> : null}
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="fullName" name="fullName" label={f.fields.fullName} autoComplete="name" required maxLength={100} defaultValue={values.fullName} error={errorFor('fullName')} />
            <TextField id="phone" name="phone" type="tel" inputMode="tel" label={f.fields.phone} autoComplete="tel" required maxLength={30} defaultValue={values.phone} error={errorFor('phone')} />
          </div>

          <SelectField id="startAvailability" name="startAvailability" label={f.fields.startAvailability} placeholder={f.choose} required options={toOptions(availabilityOptions, f.options.availability)} defaultValue={values.startAvailability} error={errorFor('startAvailability')} />

          <TextAreaField id="motivation" name="motivation" label={f.fields.motivationQuick} hint={f.hints.motivation} rows={4} required maxLength={1000} defaultValue={values.motivation} error={errorFor('motivation')} />

          <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
              <input type="checkbox" name="consent" required aria-invalid={Boolean(errorFor('consent'))} className="mt-1 size-5 shrink-0 accent-primary" />
              <span>{f.consent}</span>
            </label>
            {errorFor('consent') ? <p className="mt-1.5 text-sm text-destructive">{errorFor('consent')}</p> : null}
          </div>

          <Button type="submit" size="lg" disabled={pending} className="self-start">
            {pending ? f.submitting : f.submitQuick}
          </Button>
        </form>
      </section>
      {aside}
    </div>
  )
}
