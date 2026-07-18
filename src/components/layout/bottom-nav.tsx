import React from 'react'
import { NavLink } from 'react-router-dom'

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg width="54" height="48" viewBox="0 0 54 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M1.93118 33.0434L26.5462 45.3688L51.1612 33.0434M1.93115 23.458L25.7515 35.3772C25.9921 35.4957 26.2568 35.5573 26.5252 35.5573C26.7936 35.5573 27.0584 35.4957 27.299 35.3772L51.1403 23.4372M3.30104 14.8208L26.086 26.2815C26.2292 26.3514 26.3867 26.3878 26.5462 26.3878C26.7057 26.3878 26.863 26.3514 27.0062 26.2815L49.8018 14.8208C49.9293 14.7564 50.0364 14.658 50.1112 14.5366C50.186 14.4153 50.2257 14.2756 50.2257 14.1332C50.2257 13.9907 50.186 13.851 50.1112 13.7297C50.0364 13.6083 49.9293 13.5099 49.8018 13.4455L27.0062 2.03688C26.863 1.96695 26.7057 1.9306 26.5462 1.9306C26.3867 1.9306 26.2292 1.96695 26.086 2.03688L3.30104 13.4976C3.18624 13.566 3.09118 13.663 3.0252 13.7789C2.95921 13.8949 2.92448 14.0259 2.92448 14.1592C2.92448 14.2925 2.95921 14.4235 3.0252 14.5395C3.09118 14.6554 3.18624 14.7524 3.30104 14.8208Z"
        stroke="currentColor"
        strokeWidth="3.86118"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg width="27" height="33" viewBox="0 0 27 33" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M24.7678 32H2.23222C1.90542 32 1.592 31.8686 1.36091 31.6348C1.12983 31.4009 1.00001 31.0837 1.00001 30.753V12.731C0.999297 12.5589 1.0344 12.3886 1.10303 12.2312C1.17166 12.0738 1.27229 11.9327 1.39835 11.8173L12.6635 1.33085C12.8903 1.11816 13.1881 1 13.4974 1C13.8066 1 14.1044 1.11816 14.3312 1.33085L25.6017 11.8173C25.7267 11.9336 25.8266 12.0748 25.8952 12.232C25.9637 12.3893 25.9994 12.5591 26 12.731V30.753C26 31.0837 25.8702 31.4009 25.6391 31.6348C25.408 31.8686 25.0946 32 24.7678 32ZM10.6027 23.1798H16.4026C16.5226 23.1805 16.6412 23.2051 16.7518 23.2522C16.8624 23.2993 16.9627 23.368 17.047 23.4544C17.1313 23.5407 17.198 23.643 17.2433 23.7555C17.2886 23.8679 17.3115 23.9882 17.3108 24.1097V32H9.68919V24.1097C9.68849 23.9878 9.7116 23.867 9.7572 23.7542C9.8028 23.6414 9.86998 23.5389 9.95488 23.4525C10.0398 23.3661 10.1407 23.2975 10.2519 23.2507C10.3631 23.2039 10.4823 23.1798 10.6027 23.1798Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function AnalysisIcon({ className }: { className?: string }) {
  return (
    <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M25.7654 24.9665L32 31M7.45112 9.29609V20.7765M11.4073 20.7765V15.4605M19.5415 20.7765V18.1212M15.3635 20.7765V9.29609M23.5627 20.7765V13.6851M30.0084 15.0363C30.0084 22.7884 23.5146 29.0726 15.5042 29.0726C7.49375 29.0726 1 22.7884 1 15.0363C1 7.28427 7.49375 1 15.5042 1C23.5146 1 30.0084 7.28427 30.0084 15.0363Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M3.5 14C3.5 19.2467 7.75329 23.5 13 23.5C18.2467 23.5 22.5 19.2467 22.5 14C22.5 8.75329 18.2467 4.5 13 4.5C9.68629 4.5 6.75 5.9375 5.25 8.25M5.25 4.5V8.25H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="29" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M1.76856 19.3287C1.23053 20.6656 0.970146 22.0944 1.00272 23.5313C1.00272 29.4896 22.9864 29.4896 22.9973 23.5313C23.0299 22.0944 22.7695 20.6656 22.2315 19.3287C21.6935 17.9919 20.8886 16.7739 19.8642 15.7464C18.8397 14.7188 17.6164 13.9024 16.2659 13.345C14.9155 12.7876 13.4651 12.5005 12 12.5005C10.5349 12.5005 9.08451 12.7876 7.73405 13.345C6.38359 13.9024 5.16026 14.7188 4.13584 15.7464C3.11142 16.7739 2.30659 17.9919 1.76856 19.3287Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.9919 9.66262C14.4303 9.66262 16.4071 7.72342 16.4071 5.33131C16.4071 2.93919 14.4303 1 11.9919 1C9.55339 1 7.57663 2.93919 7.57663 5.33131C7.57663 7.72342 9.55339 9.66262 11.9919 9.66262Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

interface NavItem {
  to: string
  icon: React.ComponentType<{ className?: string }>
}

const items: NavItem[] = [
  { to: '/menu', icon: MenuIcon },
  { to: '/', icon: HomeIcon },
  { to: '/avaliacoes', icon: AnalysisIcon },
  { to: '/historico', icon: HistoryIcon },
  { to: '/perfil', icon: ProfileIcon },
]

export function BottomNav() {
  return (
    <nav className="bg-surface fixed inset-x-0 bottom-0 z-50 flex items-center justify-around rounded-t-[70px] px-8 pt-6 pb-8 shadow-lg md:hidden">
      {items.map(({ to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="relative flex size-[30px] items-center justify-center"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute -inset-x-[18px] -inset-y-[13px] rounded-[22px] bg-primary" />
              )}
              <Icon className="relative text-primary-foreground" />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
