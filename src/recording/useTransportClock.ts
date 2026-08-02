/**
 * Shared recording / simulation clock with transport controls.
 *
 * Anatomy glow and ECG acquisition both read `elapsed`.
 * Views never advance their own independent timers.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_TIME_SCALE } from '../sim/useSimulationClock'

export interface TransportClock {
  /** Absolute simulation time (seconds). */
  elapsed: number
  paused: boolean
  /** Freeze display & acquisition (monitor freeze). */
  frozen: boolean
  timeScale: number
  setTimeScale: (s: number) => void
  pause: () => void
  resume: () => void
  togglePause: () => void
  /** Advance one sample or small delta while paused. */
  stepForward: (dt_s?: number) => void
  setFrozen: (v: boolean) => void
  toggleFreeze: () => void
  /** Jump simulation time (e.g. replay last beat). */
  seek: (t: number) => void
  reset: () => void
}

/**
 * Wall-clock Δt × timeScale → simulation elapsed, with pause / freeze / step.
 */
export function useTransportClock(
  resetKey: unknown = 'default',
  initialScale: number = DEFAULT_TIME_SCALE,
): TransportClock {
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [frozen, setFrozen] = useState(false)
  const [timeScale, setTimeScale] = useState(initialScale)

  const pausedRef = useRef(paused)
  const frozenRef = useRef(frozen)
  const scaleRef = useRef(timeScale)
  pausedRef.current = paused
  frozenRef.current = frozen
  scaleRef.current = timeScale

  const rafRef = useRef(0)

  useEffect(() => {
    setElapsed(0)
    setPaused(false)
    setFrozen(false)
    let last = performance.now()

    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (!pausedRef.current && !frozenRef.current) {
        const scale = Math.max(0.05, scaleRef.current)
        setElapsed((e) => e + dt * scale)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [resetKey])

  const pause = useCallback(() => setPaused(true), [])
  const resume = useCallback(() => {
    setFrozen(false)
    setPaused(false)
  }, [])
  const togglePause = useCallback(() => setPaused((p) => !p), [])
  const stepForward = useCallback((dt_s = 1 / 250) => {
    setPaused(true)
    setElapsed((e) => e + Math.max(0.001, dt_s))
  }, [])
  const toggleFreeze = useCallback(() => setFrozen((f) => !f), [])
  const seek = useCallback((t: number) => setElapsed(Math.max(0, t)), [])
  const reset = useCallback(() => {
    setElapsed(0)
    setPaused(false)
    setFrozen(false)
  }, [])

  return {
    elapsed,
    paused,
    frozen,
    timeScale,
    setTimeScale,
    pause,
    resume,
    togglePause,
    stepForward,
    setFrozen,
    toggleFreeze,
    seek,
    reset,
  }
}
