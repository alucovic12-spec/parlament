import { z } from 'zod'
import { maxOnlinePartySize, occasions, reservationSlots } from './config'

/** Error messages are short codes that the form maps to localized copy. */
export const reservationSchema = z.object({
  fullName: z.string().trim().min(2, 'fullName').max(100, 'fullName'),
  phone: z
    .string()
    .trim()
    .min(6, 'phone')
    .max(30, 'phone')
    .regex(/^\+?[\d\s()/.-]{6,}$/, 'phone'),
  email: z.string().trim().toLowerCase().max(254, 'email').email('email'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date'),
  time: z.string().refine((value) => reservationSlots.includes(value), 'time'),
  partySize: z.coerce.number().int('partySize').min(1, 'partySize').max(maxOnlinePartySize, 'partySize'),
  occasion: z.enum(occasions, { message: 'occasion' }),
  notes: z.string().trim().max(500, 'notes'),
  consent: z.string().refine((value) => value === 'on', 'consent'),
})

export type ReservationInput = z.infer<typeof reservationSchema>
