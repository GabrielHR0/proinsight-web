import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, motion } from 'framer-motion'

interface NumberTickerProps {
  value: number
  decimals?: number
  duration?: number
  className?: string
}

export function NumberTicker({ value, decimals = 0, duration = 1.2, className }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 200,
    mass: 1,
  })

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = decimals > 0
          ? latest.toFixed(decimals)
          : Math.round(latest).toString()
      }
    })
    return unsubscribe
  }, [springValue, decimals])

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  )
}
