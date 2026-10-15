'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { signInMember, signUpMember } from '@/lib/loyalty/actions'
import type { MemberAuthState } from '@/lib/loyalty/types'
import { cn } from '@/lib/utils'

type Labels = Messages['member']
type Tab = 'register' | 'login'

const initialState: MemberAuthState = { status: 'idle' }

const inputClass =
  'h-11 w-full rounded-xl border border-input bg-card px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 aria-[invalid=true]:border-destructive'

function errorText(labels: Labels, code: string | undefined) {
  if (!code) return undefined
  return labels.errors[code as keyof Labels['errors']] ?? labels.errors.server
}

function TextField({
  form,
  name,
  type,
  label,
  autoComplete,
  defaultValue,
  error,
  hint,
  minLength,
}: {
  form: string
  name: string
  type: string
  label: string
  autoComplete: string
  defaultValue?: string
  error?: string
  hint?: string
  minLength?: number
}) {
  const id = `${form}-${name}`
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ')

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={inputClass}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function FormError({ state, labels }: { state: MemberAuthState; labels: Labels }) {
  if (state.status !== 'error' || !state.formError) return null
  return (
    <p role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
      {labels.errors[state.formError]}
    </p>
  )
}

export function AuthPanel({
  locale,
  labels,
  initialNotice,
}: {
  locale: Locale
  labels: Labels
  initialNotice?: string
}) {
  const [tab, setTab] = useState<Tab>('register')
  const [registerState, registerAction, registerPending] = useActionState(signUpMember, initialState)
  const [loginState, loginAction, loginPending] = useActionState(signInMember, initialState)

  const registerErrors = registerState.status === 'error' ? registerState.fieldErrors : {}
  const registerValues = registerState.status === 'error' ? registerState.values : {}
  const loginErrors = loginState.status === 'error' ? loginState.fieldErrors : {}
  const loginValues = loginState.status === 'error' ? loginState.values : {}

  const tabs: { id: Tab; label: string }[] = [
    { id: 'register', label: labels.tabs.register },
    { id: 'login', label: labels.tabs.login },
  ]

  return (
    <div className="interior-panel p-6 sm:p-8">
      {initialNotice ? (
        <p role="alert" className="mb-6 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
          {initialNotice}
        </p>
      ) : null}

      <div role="tablist" aria-label={labels.eyebrow} className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-border bg-muted/50 p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`member-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`member-panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={cn(
              'h-10 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              tab === item.id ? 'bg-foreground text-background' : 'text-foreground/60 hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="member-panel-register"
        aria-labelledby="member-tab-register"
        hidden={tab !== 'register'}
      >
        {registerState.status === 'check-email' ? (
          <div role="status" className="space-y-3">
            <h2 className="font-display text-2xl">{labels.checkEmail.title}</h2>
            <p className="text-muted-foreground">
              {labels.checkEmail.text} <strong className="text-foreground">{registerState.email}</strong>.{' '}
              {labels.checkEmail.after}
            </p>
            <Button type="button" variant="outline" onClick={() => setTab('login')}>
              {labels.checkEmail.toLogin}
            </Button>
          </div>
        ) : (
          <form action={registerAction} noValidate className="space-y-5">
            <input type="hidden" name="locale" value={locale} />
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <FormError state={registerState} labels={labels} />
            <TextField
              form="register"
              name="fullName"
              type="text"
              label={labels.fields.fullName}
              autoComplete="name"
              defaultValue={registerValues.fullName}
              error={errorText(labels, registerErrors.fullName)}
            />
            <TextField
              form="register"
              name="email"
              type="email"
              label={labels.fields.email}
              autoComplete="email"
              defaultValue={registerValues.email}
              error={errorText(labels, registerErrors.email)}
            />
            <TextField
              form="register"
              name="password"
              type="password"
              label={labels.fields.password}
              autoComplete="new-password"
              minLength={8}
              hint={labels.fields.passwordHint}
              error={errorText(labels, registerErrors.password)}
            />
            <div className="space-y-1.5">
              <div className="flex items-start gap-3">
                <input
                  id="register-consent"
                  name="consent"
                  type="checkbox"
                  required
                  aria-invalid={registerErrors.consent ? true : undefined}
                  aria-describedby={registerErrors.consent ? 'register-consent-error' : undefined}
                  className="mt-1 size-5 shrink-0 accent-primary"
                />
                <label htmlFor="register-consent" className="text-sm leading-relaxed text-muted-foreground">
                  {labels.consent}
                </label>
              </div>
              {registerErrors.consent ? (
                <p id="register-consent-error" className="text-sm text-destructive">
                  {errorText(labels, registerErrors.consent)}
                </p>
              ) : null}
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={registerPending}>
              {registerPending ? labels.pending : labels.submitRegister}
            </Button>
          </form>
        )}
      </div>

      <div role="tabpanel" id="member-panel-login" aria-labelledby="member-tab-login" hidden={tab !== 'login'}>
        <form action={loginAction} noValidate className="space-y-5">
          <input type="hidden" name="locale" value={locale} />
          <FormError state={loginState} labels={labels} />
          <TextField
            form="login"
            name="email"
            type="email"
            label={labels.fields.email}
            autoComplete="email"
            defaultValue={loginValues.email}
            error={errorText(labels, loginErrors.email)}
          />
          <TextField
            form="login"
            name="password"
            type="password"
            label={labels.fields.password}
            autoComplete="current-password"
            error={errorText(labels, loginErrors.password)}
          />
          <Button type="submit" size="lg" className="w-full" disabled={loginPending}>
            {loginPending ? labels.pending : labels.submitLogin}
          </Button>
        </form>
      </div>
    </div>
  )
}
