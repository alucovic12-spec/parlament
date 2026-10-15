import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CustomSection } from '@/components/home/custom-section'
import { getCustomPage } from '@/lib/content/custom-pages'
import type { Localized } from '@/lib/content/site-content'
import { customPagePath, isLocale, locales, type Locale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { defaultOgImage } from '@/lib/seo'
import { site } from '@/lib/site'

type Props = { params: Promise<{ locale: string; slug: string }> }

const pick = (value: Localized, locale: Locale) => value?.[locale]?.trim() || value?.hr?.trim() || undefined

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale)) return {}
  const page = await getCustomPage(slug)
  if (!page) return {}

  const locale = rawLocale
  const title = pick(page.title, locale) ?? site.shortName
  const description = pick(page.description, locale) ?? pick(page.intro, locale)
  const canonical = customPagePath(locale, slug)
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, customPagePath(l, slug)]))
  languages['x-default'] = customPagePath('hr', slug)

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: `${title} | ${site.shortName}`,
      description,
      url: canonical,
      locale: getMessages(locale).meta.ogLocale,
      images: [defaultOgImage],
    },
    twitter: { card: 'summary_large_image', title, description, images: [defaultOgImage.url] },
  }
}

export default async function CustomPageRoute({ params }: Props) {
  const { locale: rawLocale, slug } = await params
  if (!isLocale(rawLocale)) notFound()
  const page = await getCustomPage(slug)
  if (!page) notFound()

  const locale = rawLocale
  const title = pick(page.title, locale)
  const intro = pick(page.intro, locale)

  return (
    <main className="interior-page">
      <header className="interior-hero">
        <div className="interior-hero-inner">
          {title ? <h1 className="interior-title">{title}</h1> : null}
          {intro ? <p className="interior-intro">{intro}</p> : null}
        </div>
      </header>
      {page.blocks.map((block) => (
        <CustomSection key={block.id} locale={locale} block={block} />
      ))}
    </main>
  )
}
