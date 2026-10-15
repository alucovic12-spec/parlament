'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type HeroSlide = { src: string }

type HeroSlidesProps = {
  slides: HeroSlide[]
  labels: string[]
  intervalMs?: number
}

export function HeroSlides({ slides, labels, intervalMs = 6500 }: HeroSlidesProps) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), intervalMs)
    return () => window.clearInterval(timer)
  }, [paused, slides.length, intervalMs])

  return (
    <>
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt=""
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 75vw, 100vw"
            className={cn(
              'object-cover object-[60%_center] transition-opacity duration-[1800ms] ease-in-out',
              index === active ? 'hero-slide-active opacity-100' : 'opacity-0',
            )}
          />
        ))}
      </div>

      <div
        role="group"
        aria-label="Slideshow"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="absolute bottom-6 right-4 z-10 flex items-center gap-1 sm:right-6 lg:bottom-auto lg:right-8 lg:top-28"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={labels[index]}
            aria-current={index === active ? 'true' : undefined}
            onClick={() => setActive(index)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className="group flex h-11 w-7 items-center justify-center"
          >
            <span
              className={cn(
                'block h-0.5 w-full rounded-full transition-all group-hover:h-1',
                index === active ? 'bg-brand-gold' : 'bg-brand-cream/40 group-hover:bg-brand-gold',
              )}
            />
          </button>
        ))}
      </div>
    </>
  )
}
