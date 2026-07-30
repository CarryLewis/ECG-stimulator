import { useEffect, useRef, useState } from 'react'

/** Default playback — slow enough to follow SA → AV → His → ventricle. */
export const DEFAULT_TIME_SCALE = 0.35

/**
 * Shared simulation clock. Wall-clock Δt is scaled so conduction stages
 * remain visually trackable. Changing speed does not reset elapsed time.
 */
export function useSimulationClock(
  resetKey: unknown = 'default',
  timeScale: number = DEFAULT_TIME_SCALE,
): number {
  const [elapsed, setElapsed] = useState(0)
  const timeScaleRef = useRef(timeScale)
  timeScaleRef.current = timeScale
  const rafRef = useRef(0)

  useEffect(() => {
    setElapsed(0)
    let last = performance.now()

    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const scale = Math.max(0.05, timeScaleRef.current)
      setElapsed((e) => e + dt * scale)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [resetKey])

  return elapsed
}
