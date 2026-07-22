import { useEffect, useRef, useState } from 'react'
import { voltageSample } from '../ecg/generator'
import { LEAD_GRID, LEAD_ORDER } from '../ecg/leads'
import type { CyclePlan, LeadName } from '../ecg/types'
import EcgLeadLive from './EcgLead'

const FS = 250
/** Visible sweep window for the 12-lead tiles (seconds). */
const GRID_DURATION = 2.5
/** Longer cascade window for the lead-II rhythm channel. */
const STRIP_DURATION = 8

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
 * Live 12-lead bedside monitor.
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
  const gridN = Math.ceil(FS * GRID_DURATION)
  const stripN = Math.ceil(FS * STRIP_DURATION)

  const buffersRef = useRef(emptyBuffers(gridN))
  const stripRef = useRef(new Float32Array(stripN))
  const writeGridRef = useRef(0)
  const writeStripRef = useRef(0)
  const writtenGridRef = useRef(0)
  const writtenStripRef = useRef(0)
  const lastSampleIdxRef = useRef(-1)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    buffersRef.current = emptyBuffers(gridN)
    stripRef.current = new Float32Array(stripN)
    writeGridRef.current = 0
    writeStripRef.current = 0
    writtenGridRef.current = 0
    writtenStripRef.current = 0
    lastSampleIdxRef.current = -1
  }, [gridN, stripN, resetKey])

  useEffect(() => {
    const buffers = buffersRef.current
    const strip = stripRef.current
    const ctx = { afSeed }

    // Absolute sample index from the shared simulation clock.
    const targetIdx = Math.max(0, Math.floor(elapsed * FS))
    let idx = lastSampleIdxRef.current + 1

    // Large jump backward (clock reset) → clear rings.
    if (targetIdx < lastSampleIdxRef.current - 2) {
      for (const name of LEAD_ORDER) buffers[name].fill(0)
      strip.fill(0)
      writeGridRef.current = 0
      writeStripRef.current = 0
      writtenGridRef.current = 0
      writtenStripRef.current = 0
      idx = 0
    }

    // Catch up sample-by-sample without shifting the buffer (no scroll).
    const maxCatchUp = FS * 2
    if (targetIdx - idx > maxCatchUp) {
      idx = targetIdx - maxCatchUp
    }

    for (; idx <= targetIdx; idx++) {
      const t = idx / FS
      let vII = 0
      const g = writeGridRef.current
      for (const name of LEAD_ORDER) {
        const v = voltageSample(plan, name, t, 0, ctx)
        buffers[name][g] = v
        if (name === 'II') vII = v
      }
      writeGridRef.current = (g + 1) % gridN
      writtenGridRef.current = Math.min(writtenGridRef.current + 1, gridN)

      const s = writeStripRef.current
      strip[s] = vII
      writeStripRef.current = (s + 1) % stripN
      writtenStripRef.current = Math.min(writtenStripRef.current + 1, stripN)
    }

    lastSampleIdxRef.current = targetIdx
    setTick((n) => n + 1)
  }, [elapsed, plan, afSeed, gridN, stripN])

  const buffers = buffersRef.current
  const strip = stripRef.current
  const hr = Math.round(plan.ventricularRate)

  const cell = (name: LeadName) => (
    <div key={name} className="ecg-cell">
      <EcgLeadLive
        lead={name}
        samples={buffers[name]}
        writeIndex={writeGridRef.current}
        written={writtenGridRef.current}
        duration={GRID_DURATION}
        height={118}
        tick={tick}
        showBeam={name === 'II'}
      />
    </div>
  )

  return (
    <div className="ecg-monitor">
      <div className="ecg-monitor-hud" aria-live="polite">
        <div className="ecg-monitor-hud-left">
          <span className="ecg-monitor-mode">CASCADE SWEEP</span>
          <span className="ecg-monitor-meta">25 mm/s · 10 mm/mV · Gain ×1</span>
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
        <div className="ecg-grid">
          {LEAD_GRID.flatMap((row) => row.map((name) => cell(name)))}
        </div>
        <div className="ecg-strip">
          <div className="ecg-strip-label">II · rhythm</div>
          <EcgLeadLive
            lead="II"
            samples={strip}
            writeIndex={writeStripRef.current}
            written={writtenStripRef.current}
            duration={STRIP_DURATION}
            height={110}
            tick={tick}
            showBeam
          />
        </div>
      </div>
    </div>
  )
}
