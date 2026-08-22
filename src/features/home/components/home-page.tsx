import { useState } from 'react'
import { BackButton } from '@/components/ui/back-button'
import { DayHeader } from './day-header'
import { OverviewCard } from './overview-card'
import { DailyProgress } from './daily-progress'
import { QuickActions } from './quick-actions'
import { NextAssessmentCard } from './next-assessment-card'
import { BirthdayCard } from './birthday-card'
import { WeeklyPerformance } from './weekly-performance'
import { RecentActivity } from './recent-activity'
import { PeriodTabs } from './period-tabs'
import { ActivityList } from './activity-list'
import { ReassessmentList } from './reassessment-list'
import { Separator } from './separator'
import { SettingsContent } from '@/features/settings/components/settings-content'

type View = 'home' | 'settings'

export function HomePage() {
  const [view, setView] = useState<View>('home')

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex flex-col bg-primary px-6 pt-12 pb-24">
        {view === 'home' ? (
          <>
            <DayHeader onSettingsClick={() => setView('settings')} />
            <div className="mt-5 mx-auto flex w-full max-w-xs flex-col gap-3">
              <OverviewCard />
              <DailyProgress />
            </div>
            <QuickActions />
          </>
        ) : (
          <div className="flex items-center gap-3">
            <BackButton onClick={() => setView('home')} />
            <div>
              <h1 className="text-primary-foreground text-2xl font-bold">Configurações</h1>
              <p className="text-primary-foreground/80 text-sm">Personalize sua experiência</p>
            </div>
          </div>
        )}
      </div>

      <div
        key={view}
        className="bg-background -mt-16 z-10 flex flex-1 flex-col rounded-t-[56px] px-6 pt-8 pb-8 shadow-sm animate-in slide-in-from-bottom fade-in duration-500"
      >
        {view === 'home' ? (
          <div className="flex flex-col gap-5">
            <NextAssessmentCard />
            <PeriodTabs>
              <ActivityList />
            </PeriodTabs>
            <Separator />
            <ReassessmentList />
            <Separator />
            <BirthdayCard />
            <Separator />
            <WeeklyPerformance />
            <Separator />
            <RecentActivity />
          </div>
        ) : (
          <SettingsContent />
        )}
        <div className="h-32 shrink-0 md:hidden" />
      </div>
    </div>
  )
}