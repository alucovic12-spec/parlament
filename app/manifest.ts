import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: 'Kvartovski bar: kava, piće, program i rezervacije.',
    lang: 'hr',
    start_url: '/',
    display: 'standalone',
    background_color: '#111111',
    theme_color: '#111111',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
