import { useEffect, useRef } from 'react'

interface NumberTickerProps {
  value: number
  decimals?: number
  duration?: number
  className?: string
}

export function NumberTicker({ value, decimals = 0, duration = 1.2, className }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const startTime = performance.now()
    const startValue = decimals > 0
      ? parseFloat(el.textContent || '0')
      : parseInt(el.textContent || '0', 10)

    let raf: number

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (value - startValue) * eased

      el.textContent = decimals > 0
        ? current.toFixed(decimals)
        : Math.round(current).toString()

      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, decimals, duration])

  return (
    <span
      ref={ref}
      className={className}
      style={{ opacity: 1 }}
    />
  )
}
