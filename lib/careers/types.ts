export type ApplicationFieldName =
  | 'fullName'
  | 'phone'
  | 'email'
  | 'city'
  | 'type'
  | 'position'
  | 'experience'
  | 'skills'
  | 'languages'
  | 'startAvailability'
  | 'days'
  | 'shifts'
  | 'hoursPerWeek'
  | 'weekends'
  | 'isStudent'
  | 'studentContract'
  | 'expectedPay'
  | 'motivation'
  | 'linkedin'
  | 'cv'
  | 'consent'

/** Submitted values echoed back after a validation error so the candidate does not retype them. */
export type ApplicationValues = Partial<
  Record<Exclude<ApplicationFieldName, 'days' | 'shifts' | 'cv'>, string>
> & {
  days?: string[]
  shifts?: string[]
}

export type ApplicationState =
  | { status: 'idle' }
  | {
      status: 'error'
      fieldErrors: Partial<Record<ApplicationFieldName, string>>
      formError?: 'rateLimit' | 'server'
      values: ApplicationValues
    }
  | { status: 'success' }

export const initialApplicationState: ApplicationState = { status: 'idle' }
