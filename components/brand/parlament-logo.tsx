import { TEMPLE_HEIGHT, TEMPLE_WIDTH, TempleShapes } from '@/components/brand/temple-mark'
import { cn } from '@/lib/utils'

export type LogoVariant = 'stacked' | 'horizontal' | 'wordmark' | 'mark'
export type LogoTone = 'gold' | 'cream' | 'ink'

const toneClass: Record<LogoTone, string> = {
  gold: 'text-brand-gold',
  cream: 'text-brand-cream',
  ink: 'text-brand-ink',
}

const PAD = 3
const TITLE_WIDTH = 700
const TITLE_SIZE = 84
const TITLE_BASELINE = 61
const RULE_WIDTH = 56
const RULE_HEIGHT = 3
const LOGO_FONT = 'var(--font-logo), Montserrat, system-ui, sans-serif'

/** The logo scales with the font size of its element: 1em equals 100 logo units. */
const EM_PER_UNIT = 0.01

/** Optical sizing for small renders such as the header: larger, sturdier tagline. */
function metrics(optical: boolean) {
  const taglineSize = optical ? 41 : 36
  const taglineWidth = optical ? 392 : 346
  const taglineBaseline = TITLE_BASELINE + (optical ? 56 : 54)
  const ruleY = taglineBaseline + 22
  return {
    taglineSize,
    taglineWidth,
    taglineBaseline,
    taglineWeight: optical ? 400 : 300,
    ruleY,
    heightWithRule: ruleY + RULE_HEIGHT,
    heightWithoutRule: taglineBaseline + 11,
  }
}

type WordmarkProps = { optical: boolean; showRule: boolean; tone: LogoTone }

function Wordmark({ optical, showRule, tone }: WordmarkProps) {
  const { taglineSize, taglineWidth, taglineBaseline, taglineWeight, ruleY } = metrics(optical)

  return (
    <g fill="currentColor" style={{ fontFamily: LOGO_FONT }}>
      <text
        x={0}
        y={TITLE_BASELINE}
        fontSize={TITLE_SIZE}
        fontWeight={800}
        textLength={TITLE_WIDTH}
        lengthAdjust="spacing"
      >
        PARLAMENT
      </text>
      <text
        x={(TITLE_WIDTH - taglineWidth) / 2}
        y={taglineBaseline}
        fontSize={taglineSize}
        fontWeight={taglineWeight}
        textLength={taglineWidth}
        lengthAdjust="spacing"
      >
        {'people\u2019s bar'}
      </text>
      {showRule ? (
        <rect
          x={(TITLE_WIDTH - RULE_WIDTH) / 2}
          y={ruleY}
          width={RULE_WIDTH}
          height={RULE_HEIGHT}
          fill={tone === 'ink' ? 'currentColor' : 'var(--color-brand-gold, #FFE0A3)'}
        />
      ) : null}
    </g>
  )
}

type Composition = { width: number; height: number; content: React.ReactNode }

function compose(variant: LogoVariant, optical: boolean, tone: LogoTone): Composition {
  const { heightWithRule, heightWithoutRule } = metrics(optical)

  if (variant === 'mark') {
    return { width: TEMPLE_WIDTH, height: TEMPLE_HEIGHT, content: <TempleShapes /> }
  }

  if (variant === 'wordmark') {
    return { width: TITLE_WIDTH, height: heightWithRule, content: <Wordmark optical={optical} showRule tone={tone} /> }
  }

  if (variant === 'horizontal') {
    const height = heightWithoutRule
    const templeScale = height / TEMPLE_HEIGHT
    const templeWidth = TEMPLE_WIDTH * templeScale
    const gap = 46
    const dividerWidth = 3
    const dividerHeight = height * 0.8
    const wordmarkX = templeWidth + gap + dividerWidth + gap
    return {
      width: wordmarkX + TITLE_WIDTH,
      height,
      content: (
        <>
          <g transform={`scale(${templeScale})`}>
            <TempleShapes />
          </g>
          <rect
            x={templeWidth + gap}
            y={(height - dividerHeight) / 2}
            width={dividerWidth}
            height={dividerHeight}
            fill={tone === 'ink' ? 'currentColor' : 'var(--color-brand-gold, #FFE0A3)'}
          />
          <g transform={`translate(${wordmarkX} 0)`}>
            <Wordmark optical={optical} showRule={false} tone={tone} />
          </g>
        </>
      ),
    }
  }

  const templeWidth = TITLE_WIDTH * 0.34
  const templeScale = templeWidth / TEMPLE_WIDTH
  const templeHeight = TEMPLE_HEIGHT * templeScale
  const gap = 58
  return {
    width: TITLE_WIDTH,
    height: templeHeight + gap + heightWithRule,
    content: (
      <>
        <g transform={`translate(${(TITLE_WIDTH - templeWidth) / 2} 0) scale(${templeScale})`}>
          <TempleShapes />
        </g>
        <g transform={`translate(0 ${templeHeight + gap})`}>
          <Wordmark optical={optical} showRule tone={tone} />
        </g>
      </>
    ),
  }
}

type ParlamentLogoProps = {
  variant?: LogoVariant
  tone?: LogoTone
  /** Use for renders under ~64px tall: larger tagline and a sturdier weight. */
  optical?: boolean
  /** The logo scales with the font size of this element, so size it with a `text-*` class. */
  className?: string
}

/**
 * The final PARLAMENT logo: solid temple mark, heavy wide wordmark and light "people's bar" tagline.
 * Variants: stacked (primary), horizontal (header), wordmark, mark.
 */
export function ParlamentLogo({ variant = 'stacked', tone = 'gold', optical = false, className }: ParlamentLogoProps) {
  const { width, height, content } = compose(variant, optical, tone)
  const isMark = variant === 'mark'

  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${width + PAD * 2} ${height + PAD * 2}`}
      style={{ height: `${(height + PAD * 2) * EM_PER_UNIT}em`, width: 'auto' }}
      className={cn('inline-block shrink-0', toneClass[tone], className)}
      role="img"
      aria-label={isMark ? 'Parlament' : 'Parlament People\u2019s Bar'}
    >
      {content}
    </svg>
  )
}
