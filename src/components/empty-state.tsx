import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="text-muted-foreground mb-4">
        {icon || <Inbox size={40} strokeWidth={1.5} />}
      </div>
      <p className="text-foreground mb-1 text-sm font-medium">{title}</p>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-[240px] text-xs leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  )
}
