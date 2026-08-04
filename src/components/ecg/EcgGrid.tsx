import { useEffect, useRef, useState } from 'react'
import { voltageSample } from '../../ecg/generator'
import { LEAD_GRID, LEAD_ORDER } from '../../ecg/leads'
import type { CyclePlan, LeadName } from '../../ecg/types'
import { useLanguage } from '../../i18n'
import EcgLeadLive from './EcgLead'

const FS = 250
const GRID_DURATION = 2.5
const STRIP_DURATION = 10

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

function pushSample(
  buf: Float32Array,
  capacity: number,
  filled: number,
  value: number,
): number {
  if (filled < capacity) {
    buf[filled] = value
    return filled + 1
  }
  buf.copyWithin(0, 1)
  buf[capacity - 1] = value
  return capacity
}

/**
 * Live 12-lead + lead-II strip. All leads are sampled once per frame from the
 * shared dipole engine so timing (and AF RR) stays identical across the grid
 * and locked to the conduction clock.
 */
export default function EcgGrid({
  plan,
  elapsed,
  afSeed = 23,
  resetKey,
}: EcgGridProps) {
  const { t } = useLanguage()
  const gridN = Math.ceil(FS * GRID_DURATION)
  const stripN = Math.ceil(FS * STRIP_DURATION)

  const buffersRef = useRef(emptyBuffers(gridN))
  const stripRef = useRef(new Float32Array(stripN))
  const filledGridRef = useRef(0)
  const filledStripRef = useRef(0)
  const lastTRef = useRef(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    buffersRef.current = emptyBuffers(gridN)
    stripRef.current = new Float32Array(stripN)
    filledGridRef.current = 0
    filledStripRef.current = 0
    lastTRef.current = 0
  }, [gridN, stripN, resetKey])

  useEffect(() => {
    const buffers = buffersRef.current
    const strip = stripRef.current
    const ctx = { afSeed }

    if (elapsed < lastTRef.current - 0.05) {
      for (const name of LEAD_ORDER) buffers[name].fill(0)
      strip.fill(0)
      filledGridRef.current = 0
      filledStripRef.current = 0
      lastTRef.current = 0
    }

    let t = lastTRef.current
    if (filledGridRef.current === 0 && elapsed > 1 / FS) {
      const gridStart = Math.max(0, elapsed - GRID_DURATION)
      const stripStart = Math.max(0, elapsed - STRIP_DURATION)
      for (let tt = stripStart; tt < gridStart; tt += 1 / FS) {
        const vII = voltageSample(plan, 'II', tt, 0, ctx)
        filledStripRef.current = pushSample(
          strip,
          stripN,
          filledStripRef.current,
          vII,
        )
      }
      t = gridStart
    }

    for (; t <= elapsed + 1e-9; t += 1 / FS) {
      let vII = 0
      for (const name of LEAD_ORDER) {
        const v = voltageSample(plan, name, t, 0, ctx)
        filledGridRef.current = pushSample(
          buffers[name],
          gridN,
          filledGridRef.current,
          v,
        )
        if (name === 'II') vII = v
      }
      filledStripRef.current = pushSample(
        strip,
        stripN,
        filledStripRef.current,
        vII,
      )
    }
    lastTRef.current = elapsed
    setTick((n) => n + 1)
  }, [elapsed, plan, afSeed, gridN, stripN])

  const buffers = buffersRef.current
  const strip = stripRef.current

  const cell = (name: LeadName) => (
    <div key={name} className="ecg-cell">
      <EcgLeadLive
        lead={name}
        samples={buffers[name]}
        filled={Math.min(filledGridRef.current, gridN)}
        duration={GRID_DURATION}
        height={130}
        tick={tick}
      />
    </div>
  )

  return (
    <div className="ecg-grid-wrap">
      <div className="ecg-live-badge" aria-live="polite">
        {t('ecgLiveBadge')}
      </div>
      <div className="ecg-grid">
        {LEAD_GRID.flatMap((row) => row.map((name) => cell(name)))}
      </div>
      <div className="ecg-strip">
        <EcgLeadLive
          lead="II"
          samples={strip}
          filled={Math.min(filledStripRef.current, stripN)}
          duration={STRIP_DURATION}
          height={120}
          tick={tick}
        />
      </div>
    </div>
  )
}
