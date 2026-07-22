import { useEffect, useRef, useState } from 'react'

/**
 * Shared wall-clock for the ECG monitor and conduction diagram.
 * Resets when `resetKey` changes (e.g. disease / parameter edits) so both
 * views restart from a common t = 0.
 */
export function useSimulationClock(resetKey: unknown): number {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    startRef.current = null
    setElapsed(0)

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now
      setElapsed((now - startRef.current) / 1000)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [resetKey])

  return elapsed
}
