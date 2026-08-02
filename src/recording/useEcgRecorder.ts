/**
 * React binding: advance the physiology-driven recorder from the shared clock.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_HEART_RATE_BPM } from '../sim/sinusTiming'
import {
  advanceRecorder,
  createRecorder,
  resetRecorder,
  setRecorderRate,
  type RecorderState,
} from './recorder'
import type { EcgRingBuffer } from './ringBuffer'
import { DEFAULT_FS_HZ } from './types'

export interface EcgRecorderHandle {
  buffer: EcgRingBuffer
  /** Increments when new samples are appended (triggers canvas paint). */
  frame: number
  lastSampled_t: number
  reset: () => void
}

/**
 * Subscribe to simulation elapsed time and append ECG samples.
 * When `armed` is false (freeze), the buffer is held — no jump-redraw.
 */
export function useEcgRecorder(
  elapsed: number,
  rateBpm: number = DEFAULT_HEART_RATE_BPM,
  armed = true,
  fs = DEFAULT_FS_HZ,
): EcgRecorderHandle {
  const recRef = useRef<RecorderState>(createRecorder(fs, rateBpm))
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    setRecorderRate(recRef.current, rateBpm)
  }, [rateBpm])

  useEffect(() => {
    if (!armed) return
    const added = advanceRecorder(recRef.current, elapsed)
    if (added > 0) setFrame((n) => n + 1)
  }, [elapsed, armed])

  return useMemo(
    () => ({
      buffer: recRef.current.buffer,
      frame,
      lastSampled_t: recRef.current.lastSampled_t,
      reset: () => {
        resetRecorder(recRef.current)
        setFrame((n) => n + 1)
      },
    }),
    [frame],
  )
}
