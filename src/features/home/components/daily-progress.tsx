export function DailyProgress() {
  const completed = 5
  const total = 8

  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <div className="relative w-full max-w-[300px]">
        <div className="bg-primary-foreground/20 h-8 w-full overflow-hidden rounded-full">
          <div
            className="bg-background h-full rounded-full transition-all"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>

        <span className="text-primary-foreground absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium italic leading-none">
          {completed}
        </span>
        <span className="text-background absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium italic leading-none">
          {total}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[15px] font-normal capitalize text-primary-foreground">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="shrink-0 text-primary-foreground"
        >
          <path
            d="M10.1223 0.5H1.87774C1.11684 0.5 0.5 1.11684 0.5 1.87774V10.1223C0.5 10.8832 1.11684 11.5 1.87774 11.5H10.1223C10.8832 11.5 11.5 10.8832 11.5 10.1223V1.87774C11.5 1.11684 10.8832 0.5 10.1223 0.5Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 6.62603L5.30318 8.5L9.5 3.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Avaliações concluídas hoje
      </div>
    </div>
  )
}
