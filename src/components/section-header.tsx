import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  icon: ReactNode
  title: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({ icon, title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-2', className)}>
      <div className="flex items-center gap-2">
        <span className="text-link shrink-0">{icon}</span>
        <h2 className="text-foreground text-base font-semibold">{title}</h2>
      </div>
      {action}
    </div>
  )
}
