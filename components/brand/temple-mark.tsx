import type { SVGProps } from 'react'

export const TEMPLE_WIDTH = 120
export const TEMPLE_HEIGHT = 97

/**
 * The final Parlament temple on a 120x97 grid, drawn as solid shapes:
 * pediment ring with an inner triangle, architrave, four columns and a two-step base.
 */
export function TempleShapes() {
  return (
    <g fill="currentColor">
      <path
        fillRule="evenodd"
        d="M3 31 L60 3 L117 31 Z M20.3 27 L60 7.5 L99.7 27 Z M33.3 24 L60 10.9 L86.7 24 Z"
      />
      <rect x="8" y="34" width="104" height="7" />
      <rect x="12" y="45" width="15" height="35" />
      <rect x="39" y="45" width="15" height="35" />
      <rect x="66" y="45" width="15" height="35" />
      <rect x="93" y="45" width="15" height="35" />
      <rect x="8" y="84" width="104" height="5" />
      <rect x="2" y="92" width="116" height="5" />
    </g>
  )
}

export function TempleMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={`0 0 ${TEMPLE_WIDTH} ${TEMPLE_HEIGHT}`} aria-hidden="true" focusable="false" {...props}>
      <TempleShapes />
    </svg>
  )
}
