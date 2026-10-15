'use client'

import { useEffect, useRef, type ReactNode } from 'react'

type ParallaxProps = { children: ReactNode; speed?: number; className?: string }

/** Drifts its children vertically against the scroll. Static for visitors who prefer reduced motion. */
export function Parallax({ children, speed = 40, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight
      element.style.transform = `translate3d(0, ${(-offset * speed).toFixed(1)}px, 0)`
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [speed])

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}
