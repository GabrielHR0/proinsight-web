import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Greeting } from './greeting'
import { OverviewCard } from './overview-card'
import { DailyProgress } from './daily-progress'
import { QuickActions } from './quick-actions'
import { PeriodTabs } from './period-tabs'
import { ActivityList } from './activity-list'
import { HighlightCard } from './highlight-card'
import { SettingsContent } from '@/features/settings/components/settings-content'

type View = 'home' | 'settings'

export function HomePage() {
  const [view, setView] = useState<View>('home')

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <div className="flex flex-col bg-primary px-6 pt-12 pb-24">
        {view === 'home' ? (
          <>
            <Greeting onSettingsClick={() => setView('settings')} />
            <OverviewCard />
            <DailyProgress />
            <QuickActions />
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setView('home')} className="rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-primary-foreground text-2xl font-bold">Configurações</h1>
              <p className="text-primary-foreground/80 text-sm">Personalize sua experiência</p>
            </div>
          </div>
        )}
      </div>

      {/* Content card — remonta com animação cada vez que a view muda */}
      <div
        key={view}
        className="bg-background -mt-16 z-10 flex flex-1 flex-col rounded-t-[56px] px-6 pt-8 pb-8 shadow-sm animate-in slide-in-from-bottom fade-in duration-500"
      >
        {view === 'home' ? (
          <>
            <HighlightCard />
            <div className="mt-4">
              <PeriodTabs>
                <ActivityList />
              </PeriodTabs>
            </div>
          </>
        ) : (
          <SettingsContent />
        )}
        <div className="h-32 shrink-0 md:hidden" />
      </div>
    </div>
  )
}
