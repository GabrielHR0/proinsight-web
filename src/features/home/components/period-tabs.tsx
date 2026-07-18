import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ReactNode } from 'react'

const periods = [
  { value: 'diario', label: 'Diário' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
] as const

interface PeriodTabsProps {
  children: ReactNode
}

export function PeriodTabs({ children }: PeriodTabsProps) {
  return (
    <Tabs defaultValue="diario" className="w-full">
      <TabsList className="flex !h-auto w-full items-center justify-center gap-6 rounded-[22px] bg-surface p-[6px_14px] dark:bg-card">
        {periods.map((p) => (
          <TabsTrigger
            key={p.value}
            value={p.value}
            className="flex h-[31px] flex-1 items-center justify-center rounded-[10px] border-0 bg-surface px-0 py-0 text-[15px] font-normal text-foreground capitalize shadow-none transition-all data-[state=active]:h-12 data-[state=active]:rounded-[19px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:bg-card dark:text-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
          >
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {periods.map((p) => (
        <TabsContent key={p.value} value={p.value} className="mt-5">
          {p.value === 'diario' ? children : null}
        </TabsContent>
      ))}
    </Tabs>
  )
}
