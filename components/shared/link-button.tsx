import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
}

export function LinkButton({ variant = 'default', className, children, ...props }: LinkButtonProps) {
  return (
    <Link
      className={cn(
        buttonVariants({ variant }),
        'group h-12 min-w-11 gap-2 rounded-full px-6 text-sm font-medium tracking-[0.01em] motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-0.5',
        variant === 'default' &&
          'bg-primary text-primary-foreground hover:bg-primary/85 [a]:hover:bg-primary/85',
        variant === 'outline' &&
          'border border-foreground/30 bg-transparent text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground dark:border-foreground/30 dark:bg-transparent dark:hover:bg-primary',
        variant === 'ghost' &&
          'text-foreground hover:bg-foreground/10 hover:text-foreground dark:hover:bg-foreground/10',
        className,
      )}
      {...props}
    >
      {children}
      <ArrowUpRight
        aria-hidden
        className="size-4 shrink-0 motion-safe:transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
      />
    </Link>
  )
}
