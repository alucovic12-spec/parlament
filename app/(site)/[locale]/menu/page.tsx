import type { Metadata } from 'next'
import { MenuBrowser } from '@/components/menu/menu-browser'
import { LinkButton } from '@/components/shared/link-button'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import { getMessagesWithContent } from '@/lib/content/site-content'
import { getMenu } from '@/lib/menu/get-menu'
import { JsonLd } from '@/components/shared/json-ld'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata(locale as Locale, 'menu')
}

export default async function MenuPage({ params }: Props) {
  const locale = (await params).locale as Locale
  const [m, { categories, items }] = await Promise.all([getMessagesWithContent(locale), getMenu(locale)])

  return (
    <main className="interior-page">
      <JsonLd data={breadcrumbJsonLd(locale, 'menu')} />
      <header className="interior-hero">
        <div className="interior-hero-inner">
        <p className="interior-eyebrow">{m.menu.eyebrow}</p>
        <h1 className="interior-title">{m.pages.menu.title}</h1>
        <p className="interior-intro">{m.menu.intro}</p>
        </div>
      </header>

      <MenuBrowser locale={locale} labels={m.menu} categories={categories} items={items} />

      <section aria-labelledby="menu-reserve" className="border-t border-border bg-card py-20 sm:py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 id="menu-reserve" className="font-display text-4xl">
              {m.menu.reserveTitle}
            </h2>
            <p className="mt-2 max-w-md text-foreground/80">{m.menu.reserveText}</p>
          </div>
          <LinkButton href={localizedPath(locale, 'reservations')}>{m.menu.reserveCta}</LinkButton>
        </div>
      </section>
    </main>
  )
}
