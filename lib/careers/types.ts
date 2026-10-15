export type ApplicationFieldName =
  | 'fullName'
  | 'phone'
  | 'type'
  | 'startAvailability'
  | 'motivation'
  | 'consent'

export type ApplicationValues = Partial<Record<ApplicationFieldName, string>>

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
