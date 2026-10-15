/**
 * Central business configuration.
 * Every value that is `null` is unconfirmed and is rendered as a clearly marked placeholder.
 * Replace the values here (or later via the admin panel) once they are confirmed.
 */
export type BrandImage = { src: string; width: number; height: number; alt: string }

export const site = {
  name: 'PARLAMENT — People’s Bar',
  shortName: 'PARLAMENT',

  /** Official brand files. Leave null until they are delivered; never replace with an invented mark. */
  brand: {
    logoHorizontal: null as BrandImage | null,
    logoVertical: null as BrandImage | null,
  },

  contact: {
    address: null as string | null,
    phone: null as string | null,
    /** Main address for every feature that needs an email: reservations, job applications, contact. */
    email: 'info@parlament.bar' as string | null,
    hours: null as string | null,
  },

  social: {
    instagram: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
  },
}

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  return 'http://localhost:3000'
}
