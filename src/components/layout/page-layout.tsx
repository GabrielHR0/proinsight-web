import type { ReactNode } from 'react'

interface PageLayoutProps {
  header: ReactNode
  children: ReactNode
  compact?: boolean
}

export function PageLayout({ header, children, compact = false }: PageLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className={`flex flex-col bg-primary px-6 ${compact ? 'pt-8 pb-28' : 'pt-12 pb-24'}`}>
        {header}
      </div>

      <div className="bg-background -mt-16 flex flex-1 flex-col rounded-t-[56px] px-6 pt-8 pb-8">
        {children}
        <div className="h-32 shrink-0 md:hidden" />
      </div>
    </div>
  )
}
