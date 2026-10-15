export const applicationTypes = ['experienced', 'learner', 'student'] as const
export type ApplicationType = (typeof applicationTypes)[number]

export const applicationModes = ['full', 'quick'] as const
export type ApplicationMode = (typeof applicationModes)[number]

export const positions = [
  'waiter',
  'bartender',
  'barback',
  'host',
  'shiftLead',
  'eventStaff',
  'other',
] as const
export type Position = (typeof positions)[number]

/** Roles offered per entry card; shift lead is only relevant to experienced candidates. */
export const positionsByType: Record<ApplicationType, readonly Position[]> = {
  experienced: ['waiter', 'bartender', 'barback', 'host', 'shiftLead', 'eventStaff', 'other'],
  learner: ['waiter', 'bartender', 'barback', 'host', 'eventStaff', 'other'],
  student: ['waiter', 'bartender', 'barback', 'host', 'eventStaff', 'other'],
}

export const experienceLevels = ['none', 'lt1', 'oneToThree', 'threePlus'] as const
export const availabilityOptions = ['now', 'twoWeeks', 'month', 'later'] as const
export const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export const shiftOptions = ['morning', 'afternoon', 'evening', 'night'] as const
export const hoursOptions = ['lt15', 'fifteenToTwentyFive', 'twentyFiveToForty', 'fortyPlus', 'flexible'] as const
export const weekendOptions = ['yes', 'sometimes', 'no'] as const
export const yesNoOptions = ['yes', 'no'] as const

export const cvMaxBytes = 5 * 1024 * 1024
export const cvBucket = 'candidate-cvs'
export const cvAllowed = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const

/** Rate limits per rolling window. */
export const limits = {
  perIpPerHour: 5,
  perPhonePerDay: 2,
}
