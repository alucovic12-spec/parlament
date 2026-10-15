import { CmsImage as Image } from '@/components/shared/cms-image'
import { Parallax } from '@/components/shared/parallax'
import { Reveal } from '@/components/shared/reveal'
import { Section, SectionHeading } from '@/components/shared/section'
import type { Messages } from '@/lib/i18n/messages'

export function Concept({ m, images }: { m: Messages; images: { main: string | null; accent: string | null } }) {
  const c = m.home.concept

  return (
    <Section labelledBy="concept-title" tone="dusk">
      <div className={images.main || images.accent ? 'grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-24' : 'grid grid-cols-1 gap-12'}>
        <Reveal className="min-w-0">
          <SectionHeading id="concept-title" eyebrow={c.eyebrow} title={c.title} intro={c.text} />
        </Reveal>

        {images.main || images.accent ? (
        <Reveal>
          <div className="relative mx-auto max-w-lg pb-14 pr-4 lg:max-w-none">
            {images.main ? (
            <Parallax speed={50}>
              <div className="image-reveal glow-card group relative aspect-[5/4] overflow-hidden rounded-[2.5rem] border border-brand-cream/12 shadow-[0_28px_60px_-42px_rgb(0_0_0_/_80%)]">
                <Image
                  src={images.main}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-contain motion-safe:transition-transform motion-safe:duration-1000 group-hover:scale-105"
                />
              </div>
            </Parallax>
            ) : null}
            {images.accent ? (
            <Parallax speed={-70} className="absolute -bottom-2 -left-2 w-[38%] sm:-left-8">
              <div className="group relative aspect-square overflow-hidden rounded-2xl border-4 border-brand-cream/80 shadow-[0_22px_60px_-24px_rgb(0_0_0_/_80%)] motion-safe:transition-transform motion-safe:duration-500 hover:-translate-y-2 hover:scale-[1.03]">
                <Image
                  src={images.accent}
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-contain motion-safe:transition-transform motion-safe:duration-700 group-hover:scale-110"
                />
              </div>
            </Parallax>
            ) : null}
          </div>
        </Reveal>
        ) : null}
      </div>
    </Section>
  )
}
