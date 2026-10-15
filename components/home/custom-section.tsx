import { CmsImage as Image } from '@/components/shared/cms-image'
import { LinkButton } from '@/components/shared/link-button'
import { Reveal } from '@/components/shared/reveal'
import { Section, SectionHeading } from '@/components/shared/section'
import { resolveButtons } from '@/lib/content/links'
import type { CustomBlock } from '@/lib/content/home-layout'
import type { Localized } from '@/lib/content/site-content'
import type { Locale } from '@/lib/i18n/config'
import { linkAttrs } from '@/lib/navigation'
import { cn } from '@/lib/utils'

const pick = (value: Localized, locale: Locale) => value?.[locale]?.trim() || value?.hr?.trim() || undefined

export function CustomSection({ locale, block }: { locale: Locale; block: CustomBlock }) {
  const eyebrow = pick(block.eyebrow, locale)
  const title = pick(block.title, locale)
  const text = pick(block.text, locale)
  const buttons = resolveButtons(block.buttons, locale)
  const headingId = `custom-${block.id}`

  if (!eyebrow && !title && !text && !block.image && buttons.length === 0) return null

  const alt = block.imageAlt ?? ''
  const showSideImage = Boolean(block.image) && (block.imagePosition === 'left' || block.imagePosition === 'right')
  const isBackground = Boolean(block.image) && block.imagePosition === 'background'

  const content = (
    <div>
      <SectionHeading id={headingId} eyebrow={eyebrow} title={title} intro={text} />
      {buttons.length > 0 ? (
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {buttons.map((button, index) => (
            <LinkButton
              key={`${button.href}-${index}`}
              href={button.href}
              variant={button.variant}
              {...linkAttrs(button)}
              className="w-full sm:w-auto"
            >
              {button.label}
            </LinkButton>
          ))}
        </div>
      ) : null}
    </div>
  )

  return (
    <Section
      id={block.anchor ?? undefined}
      labelledBy={title ? headingId : undefined}
      tone={isBackground ? 'ink' : block.tone}
      sectionClassName={cn(isBackground && 'isolate py-32 sm:py-44')}
      className={cn(isBackground && 'z-10')}
    >
      {isBackground && block.image ? (
        <>
          <Image src={block.image} alt={alt} fill sizes="100vw" className="-z-20 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-brand-ink/70" />
        </>
      ) : null}
      <Reveal>
        {showSideImage && block.image ? (
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className={cn(block.imagePosition === 'left' && 'lg:order-2')}>{content}</div>
            <div
              className={cn(
                'image-reveal relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-brand-cream/12 bg-brand-ink',
                block.imagePosition === 'left' && 'lg:order-1',
              )}
            >
              <Image src={block.image} alt={alt} fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-contain" />
            </div>
          </div>
        ) : (
          content
        )}
      </Reveal>
    </Section>
  )
}
