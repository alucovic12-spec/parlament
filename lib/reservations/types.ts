export type ReservationFieldName =
  | 'fullName'
  | 'phone'
  | 'email'
  | 'date'
  | 'time'
  | 'partySize'
  | 'occasion'
  | 'notes'
  | 'consent'

export type ReservationValues = Partial<Record<ReservationFieldName, string>>

export type ReservationState =
  | { status: 'idle' }
  | {
      status: 'error'
      fieldErrors: Partial<Record<ReservationFieldName, string>>
      formError?: 'rateLimit' | 'server'
      values: ReservationValues
    }
  | {
      status: 'success'
      summary: { date: string; time: string; partySize: number }
    }

export const initialReservationState: ReservationState = { status: 'idle' }
