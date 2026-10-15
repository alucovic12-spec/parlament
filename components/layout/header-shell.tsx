'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const SCROLL_THRESHOLD = 24

export function HeaderShell({ children, className }: { children: ReactNode; className?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      headerRef.current?.style.setProperty('--scroll-progress', progress.toFixed(4))
      setScrolled(window.scrollY > SCROLL_THRESHOLD)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <header ref={headerRef} data-scrolled={scrolled} className={cn('group/header', className)}>
      {children}
    </header>
  )
}
