import { z } from 'zod'
import {
  applicationTypes,
  availabilityOptions,
  experienceLevels,
  hoursOptions,
  positions,
  shiftOptions,
  weekDays,
  weekendOptions,
  yesNoOptions,
} from './config'

const phone = z
  .string()
  .trim()
  .min(6, 'phone')
  .max(30, 'phone')
  .regex(/^\+?[\d\s()/.-]{6,}$/, 'phone')

const shared = {
  fullName: z.string().trim().min(2, 'fullName').max(100, 'fullName'),
  phone,
  type: z.enum(applicationTypes, { message: 'type' }),
  startAvailability: z.enum(availabilityOptions, { message: 'startAvailability' }),
  motivation: z.string().trim().min(5, 'motivation').max(1000, 'motivation'),
  consent: z.string().refine((value) => value === 'on', 'consent'),
}

/** Error messages are short codes that the form maps to localized copy. */
export const quickApplicationSchema = z.object(shared)

export const fullApplicationSchema = z.object({
  ...shared,
  email: z.string().trim().toLowerCase().max(254, 'email').email('email'),
  city: z.string().trim().min(2, 'city').max(100, 'city'),
  position: z.enum(positions, { message: 'position' }),
  experience: z.enum(experienceLevels, { message: 'experience' }),
  skills: z.string().trim().max(300, 'skills'),
  languages: z.string().trim().max(200, 'languages'),
  days: z.array(z.enum(weekDays)).min(1, 'days'),
  shifts: z.array(z.enum(shiftOptions)).min(1, 'shifts'),
  hoursPerWeek: z.enum(hoursOptions, { message: 'hoursPerWeek' }),
  weekends: z.enum(weekendOptions, { message: 'weekends' }),
  isStudent: z.enum(yesNoOptions).optional().catch(undefined),
  studentContract: z.enum(yesNoOptions).optional().catch(undefined),
  expectedPay: z.string().trim().max(100, 'expectedPay'),
  linkedin: z
    .string()
    .trim()
    .max(200, 'linkedin')
    .refine((value) => value === '' || /^https?:\/\/\S+\.\S+$/i.test(value), 'linkedin'),
})

export type QuickApplicationInput = z.infer<typeof quickApplicationSchema>
export type FullApplicationInput = z.infer<typeof fullApplicationSchema>
