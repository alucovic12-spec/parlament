import { z } from 'zod'
import { applicationTypes, availabilityOptions } from './config'

const phone = z
  .string()
  .trim()
  .min(6, 'phone')
  .max(30, 'phone')
  .regex(/^\+?[\d\s()/.-]{6,}$/, 'phone')

export const applicationSchema = z.object({
  fullName: z.string().trim().min(2, 'fullName').max(100, 'fullName'),
  phone,
  type: z.enum(applicationTypes, { message: 'type' }),
  startAvailability: z.enum(availabilityOptions, { message: 'startAvailability' }),
  motivation: z.string().trim().min(5, 'motivation').max(1000, 'motivation'),
  consent: z.string().refine((value) => value === 'on', 'consent'),
})

export type ApplicationInput = z.infer<typeof applicationSchema>
