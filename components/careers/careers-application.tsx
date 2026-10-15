'use client'

import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, GraduationCap, Sprout, Wine, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { submitApplication } from '@/lib/careers/actions'
import {
  applicationTypes,
  availabilityOptions,
  experienceLevels,
  hoursOptions,
  positionsByType,
  shiftOptions,
  weekDays,
  weekendOptions,
  yesNoOptions,
  type ApplicationMode,
  type ApplicationType,
} from '@/lib/careers/config'
import {
  initialApplicationState,
  type ApplicationFieldName,
  type ApplicationValues,
} from '@/lib/careers/types'
import { ChipGroup, SelectField, TextAreaField, TextField, fieldClass } from './fields'

type Labels = Messages['careersPage']

const stepOfField: Partial<Record<ApplicationFieldName, number>> = {
  fullName: 0,
  phone: 0,
  email: 0,
  city: 0,
  type: 0,
  position: 1,
  experience: 1,
  skills: 1,
  languages: 1,
  startAvailability: 2,
  days: 2,
  shifts: 2,
  hoursPerWeek: 2,
  weekends: 2,
  isStudent: 2,
  studentContract: 2,
  expectedPay: 3,
  motivation: 3,
  linkedin: 3,
  cv: 3,
  consent: 3,
}

const typeIcons = { experienced: Wine, learner: Sprout, student: GraduationCap } as const

const toOptions = (keys: readonly string[], labels: Record<string, string>) =>
  keys.map((value) => ({ value, label: labels[value] }))

type Props = { locale: Locale; labels: Labels; aside: ReactNode }

export function CareersApplication(props: Props) {
  const [attempt, setAttempt] = useState(0)
  return <Application key={attempt} {...props} onReset={() => setAttempt((value) => value + 1)} />
}

function Application({ locale, labels, aside, onReset }: Props & { onReset: () => void }) {
  const f = labels.form
  const errorText = f.errors as Record<string, string>

  const [state, formAction, pending] = useActionState(submitApplication, initialApplicationState)
  const [mode, setMode] = useState<ApplicationMode>('full')
  const [type, setType] = useState<ApplicationType | null>(null)
  const [step, setStep] = useState(0)
  const [groupErrors, setGroupErrors] = useState<{ days?: boolean; shifts?: boolean }>({})
  const [idempotencyKey, setIdempotencyKey] = useState('')

  const formRef = useRef<HTMLFormElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID())
  }, [])

  useEffect(() => {
    if (state.status !== 'error') return
    const steps = Object.keys(state.fieldErrors).map((key) => stepOfField[key as ApplicationFieldName] ?? 0)
    if (steps.length > 0) setStep(Math.min(...steps))
    requestAnimationFrame(() =>
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-group] input')?.focus(),
    )
  }, [state])

  const values: ApplicationValues = state.status === 'error' ? state.values : {}
  const fieldErrors = state.status === 'error' ? state.fieldErrors : {}
  const formError = state.status === 'error' ? state.formError : undefined
  const errorFor = (field: ApplicationFieldName) => {
    const code = fieldErrors[field]
    return code ? (errorText[code] ?? errorText[field]) : undefined
  }

  function scrollToForm() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sectionRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  function chooseType(next: ApplicationType) {
    setType(next)
    setMode('full')
    setStep(0)
    scrollToForm()
  }

  function chooseMode(next: ApplicationMode) {
    setMode(next)
    setStep(0)
  }

  function startQuick() {
    chooseMode('quick')
    scrollToForm()
  }

  function validateStep(index: number) {
    const section = formRef.current?.querySelector<HTMLElement>(`[data-step="${index}"]`)
    if (!section) return true

    const controls = section.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input[required], select[required], textarea[required]',
    )
    for (const control of controls) {
      if (!control.reportValidity()) return false
    }

    const missing: { days?: boolean; shifts?: boolean } = {}
    for (const group of ['days', 'shifts'] as const) {
      const element = section.querySelector(`[data-group="${group}"]`)
      if (element && element.querySelectorAll('input:checked').length === 0) missing[group] = true
    }
    setGroupErrors(missing)
    return Object.keys(missing).length === 0
  }

  function goToStep(next: number) {
    setStep(next)
    requestAnimationFrame(() => headingRef.current?.focus())
  }

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="rounded-2xl border border-primary/40 bg-card p-8 text-center sm:p-12"
      >
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

  const stepCount = f.stepTitles.length
  const isLastStep = step === stepCount - 1
  const positionKeys = type ? positionsByType[type] : positionsByType.experienced

  const typeField = (
    <fieldset aria-describedby={errorFor('type') ? 'type-error' : undefined}>
      <legend className="text-sm font-medium">{f.typeLabel}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {applicationTypes.map((value) => (
          <label key={value} className="flex cursor-pointer">
            <input
              type="radio"
              name="type"
              value={value}
              checked={type === value}
              onChange={() => setType(value)}
              required
              className="peer sr-only"
            />
            <span className="block w-full rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:border-primary/60 peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
              {f.types[value]}
            </span>
          </label>
        ))}
      </div>
      {errorFor('type') ? (
        <p id="type-error" className="mt-1.5 text-sm text-destructive">
          {errorFor('type')}
        </p>
      ) : null}
    </fieldset>
  )

  const consentField = (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={Boolean(errorFor('consent'))}
          aria-describedby={errorFor('consent') ? 'consent-error' : undefined}
          className="mt-1 size-5 shrink-0 accent-primary"
        />
        <span>{f.consent}</span>
      </label>
      {errorFor('consent') ? (
        <p id="consent-error" className="mt-1.5 text-sm text-destructive">
          {errorFor('consent')}
        </p>
      ) : null}
    </div>
  )

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl">{labels.cardsTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {applicationTypes.map((value) => {
            const Icon = typeIcons[value]
            const selected = mode === 'full' && type === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => chooseType(value)}
                className={cn(
                  'glow-card flex flex-col items-start gap-3 rounded-2xl border bg-card p-6 text-left text-card-foreground transition-all hover:border-foreground/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  selected ? 'border-foreground bg-accent' : 'border-border',
                )}
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-display text-xl">{labels.cards[value].title}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {labels.cards[value].text}
                </span>
                <span className="mt-auto pt-2 text-sm font-medium text-primary">
                  {selected ? labels.selected : labels.select}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={startQuick}
          className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-border bg-accent p-5 text-left text-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Zap className="size-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="font-display text-xl">{labels.quick.title}</span>
            <span className="text-sm text-muted-foreground">{labels.quick.text}</span>
          </span>
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section
          ref={sectionRef}
          id="application"
          aria-labelledby="application-title"
          className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <h2 id="application-title" className="font-display text-2xl sm:text-3xl">
            {f.title}
          </h2>

          <div role="group" aria-label={f.modeLabel} className="mt-5 inline-flex rounded-full border border-border p-1">
            {(['full', 'quick'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => chooseMode(value)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  mode === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {value === 'full' ? f.modeFull : f.modeQuick}
              </button>
            ))}
          </div>

          {formError ? (
            <p role="alert" className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm">
              {errorText[formError]}
            </p>
          ) : null}

          <form ref={formRef} action={formAction} noValidate className="mt-6">
            <input type="hidden" name="mode" value={mode} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] size-px opacity-0"
            />

            {mode === 'quick' ? (
              <div className="flex flex-col gap-5">
                {typeField}
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    id="fullName"
                    name="fullName"
                    label={f.fields.fullName}
                    autoComplete="name"
                    required
                    maxLength={100}
                    defaultValue={values.fullName}
                    error={errorFor('fullName')}
                  />
                  <TextField
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    label={f.fields.phone}
                    autoComplete="tel"
                    required
                    maxLength={30}
                    defaultValue={values.phone}
                    error={errorFor('phone')}
                  />
                </div>
                <SelectField
                  id="startAvailability"
                  name="startAvailability"
                  label={f.fields.startAvailability}
                  placeholder={f.choose}
                  required
                  options={toOptions(availabilityOptions, f.options.availability)}
                  defaultValue={values.startAvailability}
                  error={errorFor('startAvailability')}
                />
                <TextAreaField
                  id="motivation"
                  name="motivation"
                  label={f.fields.motivationQuick}
                  hint={f.hints.motivation}
                  rows={4}
                  required
                  maxLength={1000}
                  defaultValue={values.motivation}
                  error={errorFor('motivation')}
                />
                {consentField}
                <Button type="submit" size="lg" disabled={pending} className="self-start">
                  {pending ? f.submitting : f.submitQuick}
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p aria-live="polite" className="text-sm text-muted-foreground">
                    {f.step} {step + 1} {f.of} {stepCount}
                  </p>
                  <div className="mt-2 flex gap-1.5" aria-hidden="true">
                    {f.stepTitles.map((title, index) => (
                      <span
                        key={`${index}-${title}`}
                        className={cn('h-1 flex-1 rounded-full', index <= step ? 'bg-primary' : 'bg-border')}
                      />
                    ))}
                  </div>
                  <h3
                    ref={headingRef}
                    tabIndex={-1}
                    className="mt-4 font-display text-xl outline-none"
                  >
                    {f.stepTitles[step]}
                  </h3>
                </div>

                <div data-step="0" hidden={step !== 0}>
                  <div className="flex flex-col gap-5">
                    {typeField}
                    <TextField
                      id="fullName"
                      name="fullName"
                      label={f.fields.fullName}
                      autoComplete="name"
                      required
                      maxLength={100}
                      defaultValue={values.fullName}
                      error={errorFor('fullName')}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextField
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        label={f.fields.phone}
                        autoComplete="tel"
                        required
                        maxLength={30}
                        defaultValue={values.phone}
                        error={errorFor('phone')}
                      />
                      <TextField
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        label={f.fields.email}
                        autoComplete="email"
                        required
                        maxLength={254}
                        defaultValue={values.email}
                        error={errorFor('email')}
                      />
                    </div>
                    <TextField
                      id="city"
                      name="city"
                      label={f.fields.city}
                      autoComplete="address-level2"
                      required
                      maxLength={100}
                      defaultValue={values.city}
                      error={errorFor('city')}
                    />
                  </div>
                </div>

                <div data-step="1" hidden={step !== 1}>
                  <div className="flex flex-col gap-5">
                    <SelectField
                      key={type ?? 'none'}
                      id="position"
                      name="position"
                      label={f.fields.position}
                      placeholder={f.choose}
                      required
                      options={toOptions(positionKeys, f.options.positions)}
                      defaultValue={values.position}
                      error={errorFor('position')}
                    />
                    <SelectField
                      id="experience"
                      name="experience"
                      label={f.fields.experience}
                      placeholder={f.choose}
                      required
                      options={toOptions(experienceLevels, f.options.experience)}
                      defaultValue={values.experience}
                      error={errorFor('experience')}
                    />
                    <TextAreaField
                      id="skills"
                      name="skills"
                      label={f.fields.skills}
                      rows={3}
                      maxLength={300}
                      defaultValue={values.skills}
                      error={errorFor('skills')}
                    />
                    <TextField
                      id="languages"
                      name="languages"
                      label={f.fields.languages}
                      maxLength={200}
                      defaultValue={values.languages}
                      error={errorFor('languages')}
                    />
                  </div>
                </div>

                <div data-step="2" hidden={step !== 2}>
                  <div className="flex flex-col gap-5">
                    <SelectField
                      id="startAvailability"
                      name="startAvailability"
                      label={f.fields.startAvailability}
                      placeholder={f.choose}
                      required
                      options={toOptions(availabilityOptions, f.options.availability)}
                      defaultValue={values.startAvailability}
                      error={errorFor('startAvailability')}
                    />
                    <ChipGroup
                      type="checkbox"
                      name="days"
                      legend={f.fields.days}
                      options={toOptions(weekDays, f.options.days)}
                      selected={values.days ?? []}
                      error={groupErrors.days ? errorText.days : errorFor('days')}
                    />
                    <ChipGroup
                      type="checkbox"
                      name="shifts"
                      legend={f.fields.shifts}
                      options={toOptions(shiftOptions, f.options.shifts)}
                      selected={values.shifts ?? []}
                      error={groupErrors.shifts ? errorText.shifts : errorFor('shifts')}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <SelectField
                        id="hoursPerWeek"
                        name="hoursPerWeek"
                        label={f.fields.hoursPerWeek}
                        placeholder={f.choose}
                        required
                        options={toOptions(hoursOptions, f.options.hours)}
                        defaultValue={values.hoursPerWeek}
                        error={errorFor('hoursPerWeek')}
                      />
                      <SelectField
                        id="weekends"
                        name="weekends"
                        label={f.fields.weekends}
                        placeholder={f.choose}
                        required
                        options={toOptions(weekendOptions, f.options.weekends)}
                        defaultValue={values.weekends}
                        error={errorFor('weekends')}
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {type !== 'student' ? (
                        <SelectField
                          id="isStudent"
                          name="isStudent"
                          label={f.fields.isStudent}
                          placeholder="—"
                          options={toOptions(yesNoOptions, f.options.yesNo)}
                          defaultValue={values.isStudent}
                          error={errorFor('isStudent')}
                        />
                      ) : null}
                      <SelectField
                        id="studentContract"
                        name="studentContract"
                        label={f.fields.studentContract}
                        placeholder="—"
                        options={toOptions(yesNoOptions, f.options.yesNo)}
                        defaultValue={values.studentContract}
                        error={errorFor('studentContract')}
                      />
                    </div>
                  </div>
                </div>

                <div data-step="3" hidden={step !== 3}>
                  <div className="flex flex-col gap-5">
                    <TextAreaField
                      id="motivation"
                      name="motivation"
                      label={f.fields.motivation}
                      hint={f.hints.motivation}
                      rows={5}
                      required
                      maxLength={1000}
                      defaultValue={values.motivation}
                      error={errorFor('motivation')}
                    />
                    <TextField
                      id="expectedPay"
                      name="expectedPay"
                      label={f.fields.expectedPay}
                      hint={f.hints.expectedPay}
                      maxLength={100}
                      defaultValue={values.expectedPay}
                      error={errorFor('expectedPay')}
                    />
                    <TextField
                      id="linkedin"
                      name="linkedin"
                      type="url"
                      inputMode="url"
                      label={f.fields.linkedin}
                      maxLength={200}
                      defaultValue={values.linkedin}
                      error={errorFor('linkedin')}
                    />
                    <div>
                      <label htmlFor="cv" className="text-sm font-medium">
                        {f.fields.cv}
                      </label>
                      <input
                        id="cv"
                        name="cv"
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        aria-invalid={Boolean(errorFor('cv'))}
                        aria-describedby="cv-hint"
                        className={cn(
                          fieldClass,
                          'file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground',
                        )}
                      />
                      <p id="cv-hint" className="mt-1.5 text-xs text-muted-foreground">
                        {state.status === 'error' ? f.hints.cvLost : f.hints.cv}
                      </p>
                      {errorFor('cv') ? (
                        <p className="mt-1.5 text-sm text-destructive">{errorFor('cv')}</p>
                      ) : null}
                    </div>
                    {consentField}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {step > 0 ? (
                    <Button type="button" variant="outline" size="lg" onClick={() => goToStep(step - 1)}>
                      {f.back}
                    </Button>
                  ) : null}
                  {isLastStep ? (
                    <Button type="submit" size="lg" disabled={pending}>
                      {pending ? f.submitting : f.submit}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="lg"
                      onClick={() => {
                        if (validateStep(step)) goToStep(step + 1)
                      }}
                    >
                      {f.next}
                    </Button>
                  )}
                </div>
              </>
            )}
          </form>
        </section>

        {aside}
      </div>
    </div>
  )
}
