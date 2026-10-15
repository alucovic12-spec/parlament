import type { Metadata } from 'next'
import { GalleryBrowser } from '@/components/gallery/gallery-browser'
import { getGallery } from '@/lib/gallery/get-gallery'
import type { Locale } from '@/lib/i18n/config'
import { getMessagesWithContent } from '@/lib/content/site-content'
import { JsonLd } from '@/components/shared/json-ld'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata(locale as Locale, 'gallery')
}

export default async function GalleryPage({ params }: Props) {
  const locale = (await params).locale as Locale
  const m = await getMessagesWithContent(locale)
  const items = await getGallery(locale, m)

  return (
    <main className="interior-page">
      <JsonLd data={breadcrumbJsonLd(locale, 'gallery')} />
      <header className="interior-hero">
        <div className="interior-hero-inner">
          <p className="interior-eyebrow">{m.home.gallery.eyebrow}</p>
          <h1 className="interior-title">{m.pages.gallery.title}</h1>
          <p className="interior-intro">{m.galleryPage.intro}</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <GalleryBrowser items={items} labels={m.galleryPage} placeholderLabel={m.placeholder.photo} />
      </div>
    </main>
  )
}
