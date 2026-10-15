import type { Metadata } from 'next'
import Image from 'next/image'
import { ParlamentLogo, type LogoTone, type LogoVariant } from '@/components/brand/parlament-logo'

export const metadata: Metadata = {
  title: 'Brand',
  robots: { index: false, follow: false },
}

type Tile = { label: string; variant: LogoVariant; tone: LogoTone; surface: string; size: string }

const tiles: Tile[] = [
  { label: 'Vertikalni znak, zlatna na crnoj', variant: 'stacked', tone: 'gold', surface: 'bg-brand-ink', size: 'text-5xl' },
  { label: 'Vertikalni znak, crna na slonovači', variant: 'stacked', tone: 'ink', surface: 'bg-brand-cream', size: 'text-5xl' },
  { label: 'Horizontalni potpis, zlatna na antracitu', variant: 'horizontal', tone: 'gold', surface: 'bg-brand-anthracite', size: 'text-3xl' },
  { label: 'Horizontalni potpis, slonovača na crnoj', variant: 'horizontal', tone: 'cream', surface: 'bg-brand-ink', size: 'text-3xl' },
  { label: 'Samo natpis, zlatna na crnoj', variant: 'wordmark', tone: 'gold', surface: 'bg-brand-ink', size: 'text-5xl' },
  { label: 'Samo natpis, crna na zlatnoj', variant: 'wordmark', tone: 'ink', surface: 'bg-brand-gold', size: 'text-5xl' },
  { label: 'Samo hram, zlatna na crnoj', variant: 'mark', tone: 'gold', surface: 'bg-brand-ink', size: 'text-7xl' },
  { label: 'Samo hram, crna na zlatnoj', variant: 'mark', tone: 'ink', surface: 'bg-brand-gold', size: 'text-7xl' },
]

const palette = [
  { name: 'Crna', hex: '#0D0D0D', swatch: 'bg-brand-ink', light: false },
  { name: 'Antracit', hex: '#1B1A19', swatch: 'bg-brand-anthracite', light: false },
  { name: 'Topla bijela', hex: '#F3EFE7', swatch: 'bg-brand-cream', light: true },
  { name: 'Šampanj bež', hex: '#D6C6A8', swatch: 'bg-brand-green', light: true },
  { name: 'Pijesak', hex: '#D9D0C1', swatch: 'bg-brand-sand', light: true },
  { name: 'Prigušeno zlato', hex: '#C9B794', swatch: 'bg-brand-glow', light: true },
]

const rules = [
  { title: 'Zaštitni prostor', text: 'Oko logotipa ostaviti najmanje visinu slova P.' },
  { title: 'Minimalna veličina', text: 'Horizontalni znak najmanje 35 mm u tisku; vertikalni 18 mm.' },
  { title: 'Podloge', text: 'Prednost imaju antracitna, crna i boja slonovače.' },
  { title: 'Jednobojno', text: 'Dopuštene su potpuno crna, bijela ili zlatna izvedba.' },
  { title: 'Ne mijenjati', text: 'Ne rastezati, ne rotirati, ne dodavati sjene, obrube ni druge simbole.' },
  { title: 'Ne ponavljati', text: 'U jednom kadru najviše jedan dominantan i jedan diskretan znak.' },
]

export default function BrandPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl sm:text-5xl">Identitet</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Finalni logotip, paleta i pravila upotrebe. Svaka verzija je čisti vektor, pa je oštra u svakoj veličini.
      </p>

      <section aria-labelledby="palette" className="mt-12">
        <h2 id="palette" className="text-2xl">
          Paleta boja
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {palette.map((color) => (
            <li key={color.hex} className="overflow-hidden rounded-xl border border-border">
              <div className={`${color.swatch} h-28`} />
              <div className="px-4 py-3">
                <p className="text-sm">{color.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{color.hex}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="variations" className="mt-12">
        <h2 id="variations" className="text-2xl">
          Sustav logotipa
        </h2>
        <ul className="mt-4 grid gap-5 md:grid-cols-2">
          {tiles.map((tile) => (
            <li key={tile.label} className="overflow-hidden rounded-xl border border-border">
              <div className={`${tile.surface} flex min-h-64 items-center justify-center p-8`}>
                <ParlamentLogo variant={tile.variant} tone={tile.tone} className={tile.size} />
              </div>
              <p className="px-5 py-3 text-sm font-medium">{tile.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rules" className="mt-12">
        <h2 id="rules" className="text-2xl">
          Pravila upotrebe
        </h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rules.map((rule) => (
            <li key={rule.title} className="rounded-xl border border-border bg-card p-5">
              <p className="">{rule.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{rule.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="original" className="mt-12">
        <h2 id="original" className="text-2xl">
          Izvorni logotip
        </h2>
        <div className="mt-4 max-w-4xl overflow-hidden rounded-xl bg-brand-ink">
          <Image
            src="/brand/logo-system.png"
            alt="PARLAMENT People’s Bar, finalni sustav logotipa"
            width={942}
            height={589}
            className="h-auto w-full"
          />
        </div>
      </section>

      <section aria-labelledby="icon" className="mt-12">
        <h2 id="icon" className="text-2xl">
          Ikona aplikacije
        </h2>
        <div className="mt-4 flex items-end gap-6">
          {[96, 48, 32].map((size) => (
            <Image key={size} src="/icon.svg" alt={`Ikona aplikacije ${size}px`} width={size} height={size} unoptimized />
          ))}
        </div>
      </section>
    </div>
  )
}
