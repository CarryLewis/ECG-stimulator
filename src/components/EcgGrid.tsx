import { useEffect, useRef, useState } from 'react'
import { voltageSample } from '../ecg/generator'
import { LEAD_ORDER } from '../ecg/leads'
import type { CyclePlan, LeadName } from '../ecg/types'
import EcgLeadLive from './EcgLead'

const FS = 250
/** Full-width sweep window per lead row (seconds). */
const ROW_DURATION = 6

interface EcgGridProps {
  plan: CyclePlan
  elapsed: number
  afSeed?: number
  /** Clears sample buffers (e.g. when switching disease). */
  resetKey?: string | number
}

function emptyBuffers(n: number): Record<LeadName, Float32Array> {
  const map = {} as Record<LeadName, Float32Array>
  for (const name of LEAD_ORDER) map[name] = new Float32Array(n)
  return map
}

/**
 * Live 12-lead bedside monitor — one lead per horizontal row.
 *
 * Samples are written into fixed ring buffers and rendered with a cascade
 * sweep (beam moves L→R, overwriting in place). The waveform does not scroll
 * like a paper strip or sliding image.
 */
export default function EcgGrid({
  plan,
  elapsed,
  afSeed = 23,
  resetKey,
}: EcgGridProps) {
  const rowN = Math.ceil(FS * ROW_DURATION)

  const buffersRef = useRef(emptyBuffers(rowN))
  const writeRef = useRef(0)
  const writtenRef = useRef(0)
  const lastSampleIdxRef = useRef(-1)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    buffersRef.current = emptyBuffers(rowN)
    writeRef.current = 0
    writtenRef.current = 0
    lastSampleIdxRef.current = -1
  }, [rowN, resetKey])

  useEffect(() => {
    const buffers = buffersRef.current
    const ctx = { afSeed }

    const targetIdx = Math.max(0, Math.floor(elapsed * FS))
    let idx = lastSampleIdxRef.current + 1

    if (targetIdx < lastSampleIdxRef.current - 2) {
      for (const name of LEAD_ORDER) buffers[name].fill(0)
      writeRef.current = 0
      writtenRef.current = 0
      idx = 0
    }

    const maxCatchUp = FS * 2
    if (targetIdx - idx > maxCatchUp) {
      idx = targetIdx - maxCatchUp
    }

    for (; idx <= targetIdx; idx++) {
      const t = idx / FS
      const w = writeRef.current
      for (const name of LEAD_ORDER) {
        buffers[name][w] = voltageSample(plan, name, t, 0, ctx)
      }
      writeRef.current = (w + 1) % rowN
      writtenRef.current = Math.min(writtenRef.current + 1, rowN)
    }

    lastSampleIdxRef.current = targetIdx
    setTick((n) => n + 1)
  }, [elapsed, plan, afSeed, rowN])

  const buffers = buffersRef.current
  const hr = Math.round(plan.ventricularRate)

  return (
    <div className="ecg-monitor">
      <div className="ecg-monitor-hud" aria-live="polite">
        <div className="ecg-monitor-hud-left">
          <span className="ecg-monitor-mode">CASCADE SWEEP</span>
          <span className="ecg-monitor-meta">
            12 leads · 1 / row · 25 mm/s · 10 mm/mV
          </span>
        </div>
        <div className="ecg-monitor-vitals">
          <div className="ecg-vital">
            <span className="ecg-vital-label">HR</span>
            <span className="ecg-vital-value">{hr}</span>
            <span className="ecg-vital-unit">bpm</span>
          </div>
          <div className="ecg-vital ecg-vital--dim">
            <span className="ecg-vital-label">ECG</span>
            <span className="ecg-vital-value ecg-vital-value--sm">II</span>
          </div>
        </div>
      </div>

      <div className="ecg-monitor-screen">
        <div className="ecg-rows" role="list">
          {LEAD_ORDER.map((name) => (
            <div key={name} className="ecg-row" role="listitem">
              <EcgLeadLive
                lead={name}
                samples={buffers[name]}
                writeIndex={writeRef.current}
                written={writtenRef.current}
                duration={ROW_DURATION}
                height={name === 'II' ? 72 : 58}
                tick={tick}
                showBeam={name === 'II'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
