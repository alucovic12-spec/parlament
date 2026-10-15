import { z } from 'zod'

/** Error messages are short codes that the forms map to localized copy. */
const email = z.string().trim().toLowerCase().max(254, 'email').email('email')

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'fullName').max(100, 'fullName'),
  email,
  password: z.string().min(8, 'password').max(72, 'password'),
  consent: z.string().refine((value) => value === 'on', 'consent'),
})

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'passwordLogin').max(72, 'passwordLogin'),
})
