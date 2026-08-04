import { useEffect, useMemo, useRef, useState } from 'react'
import type { EcgPhaseInfo } from '../../ecg-generator'
import {
  createEcgStream,
  generateEcgFromSimulation,
  pushEcgSample,
} from '../../ecg-generator'
import { LEAD_ORDER } from '../../vector-engine'
import type { LeadName } from '../../ecg/types'

const FS = 250
const DURATION = 2.4
const CAPACITY = Math.ceil(FS * DURATION)
const DISPLAY_LEADS: LeadName[] = ['I', 'II', 'aVF', 'V1', 'V5']
const MV_SCALE = 16
const MID_Y = 32

interface EcgMiniMonitorProps {
  elapsed: number
  rateBpm: number
  phase?: EcgPhaseInfo
}

/**
 * Compact cascade — resamples the physiological pipeline each tick.
 */
export default function EcgMiniMonitor({
  elapsed,
  rateBpm,
  phase,
}: EcgMiniMonitorProps) {
  const streamRef = useRef(createEcgStream(FS, CAPACITY))
  const lastTRef = useRef(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const stream = streamRef.current
    if (elapsed < lastTRef.current - 0.05) {
      for (const name of LEAD_ORDER) {
        stream.leads[name].samples.fill(0)
        stream.leads[name].writeIndex = 0
        stream.leads[name].written = 0
      }
      lastTRef.current = Math.max(0, elapsed - 1 / FS)
      setTick((n) => n + 1)
      return
    }

    const samplePeriod = 1 / FS
    let t = lastTRef.current
    let wrote = 0
    while (t + samplePeriod <= elapsed + 1e-9 && wrote < 40) {
      t += samplePeriod
      const frame = generateEcgFromSimulation(t, rateBpm)
      pushEcgSample(stream, frame.sample)
      wrote += 1
    }
    if (wrote > 0) {
      lastTRef.current = t
      setTick((n) => n + 1)
    }
  }, [elapsed, rateBpm])

  const paths = useMemo(() => {
    void tick
    const stream = streamRef.current
    return DISPLAY_LEADS.map((lead) => ({
      lead,
      d: buildPath(
        stream.leads[lead].samples,
        stream.leads[lead].writeIndex,
        stream.leads[lead].written,
      ),
    }))
  }, [tick])

  const phaseClass = phase ? `ecg-mini-phase--${phase.phase}` : ''

  return (
    <div className="ecg-mini" aria-label="Live ECG from cardiac simulation">
      <div className="ecg-mini-head">
        <p className="ecg-mini-title">ECG from cardiac simulation</p>
        {phase && (
          <span className={`ecg-mini-phase ${phaseClass}`}>
            {phase.phase === 'p_wave'
              ? 'P'
              : phase.phase === 'qrs'
                ? 'QRS'
                : phase.phase === 't_wave'
                  ? 'T'
                  : phase.phase === 'st_segment'
                    ? 'ST'
                    : '—'}
          </span>
        )}
      </div>
      <div className="ecg-mini-grid">
        {paths.map(({ lead, d }) => (
          <div key={lead} className="ecg-mini-row">
            <span className="ecg-mini-lead">{lead}</span>
            <svg
              className="ecg-mini-svg"
              viewBox={`0 0 ${CAPACITY} 64`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`Lead ${lead}`}
            >
              <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

function buildPath(
  samples: Float32Array,
  writeIndex: number,
  written: number,
): string {
  const n = samples.length
  const count = Math.min(n, written)
  if (count < 2) return ''
  const start = written < n ? 0 : writeIndex
  let d = ''
  for (let i = 0; i < count; i++) {
    const idx = (start + i) % n
    const x = (i / (count - 1)) * (CAPACITY - 1)
    const y = MID_Y - samples[idx]! * MV_SCALE
    d +=
      i === 0
        ? `M ${x.toFixed(1)} ${y.toFixed(1)}`
        : ` L ${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}
