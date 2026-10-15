import type { Metadata } from 'next'
import type { ReactNode } from 'react'
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
import { getHomeLayout, type HomeSectionKey } from '@/lib/content/home-layout'
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
  const [m, images, { upcoming }, layout] = await Promise.all([
    getMessagesWithContent(locale),
    getHomeImages(),
    getEvents(locale),
    getHomeLayout(),
  ])
  const nextEvent = upcoming.find((event) => event.status !== 'cancelled')
  const { hidden } = images
  const announcements = upcoming.filter((event) => event.image && event.status !== 'cancelled').slice(0, 3)

  const sections: Record<HomeSectionKey, ReactNode> = {
    hero: hidden.hero ? null : <Hero locale={locale} m={m} images={images.hero} events={announcements} />,
    ticker: <Ticker m={m} />,
    nextEvent: hidden.nextEvent ? null : <NextEvent locale={locale} m={m} image={images.nextEvent} event={nextEvent} />,
    offer: hidden.offer ? null : <Offer locale={locale} m={m} images={images.offer} categories={images.offerCategories} />,
    concept: hidden.concept ? null : <Concept m={m} images={images.concept} />,
    gallery: hidden.gallery ? null : <GalleryTeaser locale={locale} m={m} images={images.gallery} />,
    careers: hidden.careers ? null : <CareersTeaser locale={locale} m={m} />,
    visit: hidden.visit ? null : <Visit locale={locale} m={m} />,
  }

  return (
    <>
      {layout.map((key) => (
        <div key={key} className="contents">
          {sections[key]}
        </div>
      ))}
    </>
  )
}
