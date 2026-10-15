import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const fieldClass =
  'mt-2 block w-full rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 aria-[invalid=true]:border-destructive'

type Common = { id: string; label: string; error?: string; hint?: string }

function describedBy(id: string, error?: string, hint?: string) {
  return [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
}

function Shell({
  id,
  label,
  error,
  hint,
  className,
  children,
}: Common & { className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type TextFieldProps = Common & {
  name: string
  type?: 'text' | 'email' | 'tel' | 'url'
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'url'
  required?: boolean
  maxLength?: number
  defaultValue?: string
  className?: string
}

export function TextField({ id, label, error, hint, className, ...input }: TextFieldProps) {
  return (
    <Shell id={id} label={label} error={error} hint={hint} className={className}>
      <input
        id={id}
        {...input}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={fieldClass}
      />
    </Shell>
  )
}

type Option = { value: string; label: string }

type SelectFieldProps = Common & {
  name: string
  options: Option[]
  placeholder: string
  required?: boolean
  defaultValue?: string
  className?: string
}

export function SelectField({
  id,
  label,
  error,
  hint,
  className,
  options,
  placeholder,
  name,
  required,
  defaultValue,
}: SelectFieldProps) {
  return (
    <Shell id={id} label={label} error={error} hint={hint} className={className}>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={fieldClass}
      >
        <option value="" disabled={required}>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Shell>
  )
}

type TextAreaFieldProps = Common & {
  name: string
  rows?: number
  required?: boolean
  maxLength?: number
  defaultValue?: string
  className?: string
}

export function TextAreaField({ id, label, error, hint, className, ...input }: TextAreaFieldProps) {
  return (
    <Shell id={id} label={label} error={error} hint={hint} className={className}>
      <textarea
        id={id}
        {...input}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(fieldClass, 'resize-y')}
      />
    </Shell>
  )
}

type ChipGroupProps = {
  name: string
  legend: string
  options: Option[]
  selected: string[]
  error?: string
  type: 'checkbox' | 'radio'
  required?: boolean
  checkedValue?: string | null
  onValueChange?: (value: string) => void
  className?: string
}

/** Visually a row of pill buttons, semantically a fieldset of native checkboxes or radios. */
export function ChipGroup({
  name,
  legend,
  options,
  selected,
  error,
  type,
  required,
  checkedValue,
  onValueChange,
  className,
}: ChipGroupProps) {
  return (
    <fieldset
      data-group={name}
      aria-describedby={error ? `${name}-error` : undefined}
      className={className}
    >
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type={type}
              name={name}
              value={option.value}
              required={required}
              className="peer sr-only"
              {...(type === 'radio'
                ? { checked: checkedValue === option.value, onChange: () => onValueChange?.(option.value) }
                : { defaultChecked: selected.includes(option.value) })}
            />
            <span className="block rounded-full border border-border px-4 py-2.5 text-sm transition-colors hover:border-primary/60 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
