export const reservationTimeZone = 'Europe/Zagreb'

/** Largest party accepted through the form; bigger groups are asked to contact the venue. */
export const maxOnlinePartySize = 12

/** How far ahead a table can be requested, in days. */
export const maxDaysAhead = 90

/** Minimum lead time for a same-day request, in minutes. */
export const minLeadMinutes = 60

/** Rate limits per rolling window. */
export const limits = {
  perIpPerHour: 5,
  perEmailPerDay: 3,
}

export const occasions = ['casual', 'birthday', 'business', 'date', 'celebration', 'other'] as const
export type Occasion = (typeof occasions)[number]

// Opening hours are not confirmed yet, so the bookable slots are a provisional 12:00–23:00 grid.
function buildSlots(): string[] {
  const slots: string[] = []
  for (let hour = 12; hour <= 23; hour += 1) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
    if (hour < 23) slots.push(`${String(hour).padStart(2, '0')}:30`)
  }
  return slots
}

export const reservationSlots = buildSlots()
