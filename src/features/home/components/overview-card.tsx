export function OverviewCard() {
  return (
    <section className="mt-5 flex justify-center">
      <div className="flex w-full max-w-[300px] items-center gap-3">
        {/* Left: Alunos */}
        <div className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl bg-[#F1FFF3] px-4 py-3">
          <div className="flex items-center gap-1.5 text-foreground">
            <svg
              width="18"
              height="18"
              viewBox="0 0 43 43"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M2 20.2H41M21.0667 41V2"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs capitalize font-normal">
              Alunos
            </span>
          </div>
          <span className="text-[26px] font-bold leading-none text-foreground">
            12
          </span>
        </div>

        {/* Right: Agenda */}
        <div className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl bg-[#F1FFF3] px-4 py-3">
          <div className="flex items-center gap-1.5"
            style={{ color: 'var(--color-link)' }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M2.87862 6.89133H16.3216M3.46354 0.63855V3.85434M7.24126 0.63855V3.85434M11.9615 0.63855V3.85434M15.7392 0.63855V3.85434M1.36906 2.49037H17.8337C18.0274 2.49037 18.2132 2.56734 18.3502 2.70434C18.4872 2.84133 18.5642 3.02714 18.5642 3.22089V14.9908C18.5642 15.3878 18.4065 15.7685 18.1258 16.0492C17.8451 16.3299 17.4644 16.4876 17.0674 16.4876H2.13533C1.73836 16.4876 1.35765 16.3299 1.07695 16.0492C0.796246 15.7685 0.63855 15.3878 0.63855 14.9908V3.22089C0.63855 3.02714 0.715514 2.84133 0.852512 2.70434C0.98951 2.56734 1.17532 2.49037 1.36906 2.49037Z"
                stroke="currentColor"
                strokeWidth="1.27712"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs capitalize font-normal">
Agenda
            </span>
          </div>
          <span
            className="text-link text-[26px] font-bold leading-none"
          >
            3
          </span>
        </div>
      </div>
    </section>
  )
}