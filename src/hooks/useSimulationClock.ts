import { useEffect, useRef, useState } from 'react'

/** Default playback rate — real cardiac timing is too fast to follow by eye. */
export const DEFAULT_TIME_SCALE = 0.35

/**
 * Shared simulation clock for the ECG monitor and conduction diagram.
 * Wall-clock advances are multiplied by `timeScale` so SA→AV→His→ventricle
 * is slow enough for human visual tracking, while both views stay locked.
 * Resets when `resetKey` changes; changing speed does not reset the timeline.
 */
export function useSimulationClock(
  resetKey: unknown,
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
