import type { Metadata } from 'next'
import { CareersTeaser } from '@/components/home/careers-teaser'
import { Concept } from '@/components/home/concept'
import { GalleryTeaser } from '@/components/home/gallery-teaser'
import { Hero } from '@/components/home/hero'
import { NextEvent } from '@/components/home/next-event'
import { Offer } from '@/components/home/offer'
import { Ticker } from '@/components/home/ticker'
import { Visit } from '@/components/home/visit'
import { getEvents } from '@/lib/events/get-events'
import type { Locale } from '@/lib/i18n/config'
import { getHomeImages } from '@/lib/content/home-images'
import { getMessagesWithContent } from '@/lib/content/site-content'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 60

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata(locale as Locale)
}

export default async function HomePage({ params }: Props) {
  const locale = (await params).locale as Locale
  const [m, images, { upcoming }] = await Promise.all([
    getMessagesWithContent(locale),
    getHomeImages(),
    getEvents(locale),
  ])
  const nextEvent = upcoming.find((event) => event.status !== 'cancelled')
  const { hidden } = images
  const announcements = upcoming.filter((event) => event.image && event.status !== 'cancelled').slice(0, 3)

  return (
    <>
      {hidden.hero ? null : <Hero locale={locale} m={m} images={images.hero} events={announcements} />}
      <Ticker m={m} />
      {hidden.nextEvent ? null : <NextEvent locale={locale} m={m} image={images.nextEvent} event={nextEvent} />}
      {hidden.offer ? null : <Offer locale={locale} m={m} images={images.offer} categories={images.offerCategories} />}
      {hidden.concept ? null : <Concept m={m} images={images.concept} />}
      {hidden.gallery ? null : <GalleryTeaser locale={locale} m={m} images={images.gallery} />}
      {hidden.careers ? null : <CareersTeaser locale={locale} m={m} />}
      {hidden.visit ? null : <Visit locale={locale} m={m} />}
    </>
  )
}
