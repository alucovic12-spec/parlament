import Image, { type ImageProps } from 'next/image'

const focalPoint = /fp=([\d.]+),([\d.]+)/

/** `next/image` that honours the focal point editors set in Studio (carried in the url fragment). */
export function CmsImage({ src, style, ...props }: ImageProps) {
  if (typeof src === 'string' && src.includes('#')) {
    const [base, fragment] = src.split('#')
    const match = fragment.match(focalPoint)
    if (match) {
      const objectPosition = `${Number(match[1]) * 100}% ${Number(match[2]) * 100}%`
      return <Image src={base} style={{ objectPosition, ...style }} {...props} />
    }
    return <Image src={base} style={style} {...props} />
  }
  return <Image src={src} style={style} {...props} />
}
