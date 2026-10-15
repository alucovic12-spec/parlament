import { CmsImage as Image } from '@/components/shared/cms-image'
import { LinkButton } from '@/components/shared/link-button'
import { Reveal } from '@/components/shared/reveal'
import { Section, SectionHeading } from '@/components/shared/section'
import { localizedPath, type Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { cn } from '@/lib/utils'

/** Same order as `gallery.tiles`: interior, atmosphere, drinks and food, events. */
const tilePositions = [
  'col-span-2 aspect-[16/10] lg:row-span-2 lg:aspect-auto',
  'aspect-[4/5] lg:aspect-auto',
  'aspect-[4/5] lg:aspect-auto',
  'col-span-2 aspect-[16/10] lg:aspect-auto',
]

export function GalleryTeaser({ locale, m, images }: { locale: Locale; m: Messages; images: (string | null)[] }) {
  const g = m.home.gallery

  return (
    <Section labelledBy="gallery-title" tone="base" sectionClassName="!pt-[59px] !pb-[52px]">
      <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading id="gallery-title" eyebrow={g.eyebrow} title={g.title} />
        <LinkButton href={localizedPath(locale, 'gallery')} variant="outline" className="self-start sm:self-auto">
          {g.cta}
        </LinkButton>
      </Reveal>

      <ul className="group/list mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:h-[38rem] lg:grid-cols-4 lg:grid-rows-2">
        {g.tiles.slice(0, tilePositions.length).map((label, index) => (
          <li
            key={index}
            className={cn(
              'glow-card image-reveal group relative overflow-hidden rounded-[1.75rem] border border-border bg-brand-ink motion-safe:transition-all motion-safe:duration-700 lg:group-hover/list:opacity-70 lg:hover:!opacity-100',
              tilePositions[index],
            )}
          >
            {images[index] ? (
              <Image
                src={images[index]}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, 50vw"
                className="object-cover motion-safe:transition-transform motion-safe:duration-1000 group-hover:scale-105"
              />
            ) : null}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-brand-ink/90 to-transparent"
            />
            {label ? (
            <p className="font-accent absolute bottom-4 left-4 rounded-full border border-white/20 bg-brand-ink/55 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-brand-cream backdrop-blur-xl motion-safe:transition-all motion-safe:duration-500 group-hover:-translate-y-0.5 group-hover:border-brand-green/60 group-hover:bg-brand-ink/75">
              {label}
            </p>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  )
}
