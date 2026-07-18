import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/stores/theme'
import { queryClient } from '@/lib/query-client'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
