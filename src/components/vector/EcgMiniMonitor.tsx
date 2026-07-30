import { useEffect, useMemo, useRef, useState } from 'react'
import type { EcgPhaseInfo, EcgSample } from '../../ecg-generator'
import { createEcgStream, pushEcgSample } from '../../ecg-generator'
import { LEAD_ORDER } from '../../vector-engine'
import type { LeadName } from '../../ecg/types'

const FS = 250
const DURATION = 2.4
const CAPACITY = Math.ceil(FS * DURATION)
const DISPLAY_LEADS: LeadName[] = ['I', 'II', 'aVF', 'V1', 'V5']

interface EcgMiniMonitorProps {
  /** Latest ECG sample from the physiological pipeline. */
  sample: EcgSample
  elapsed: number
  /** P / QRS / T phase locked to cardiac activation. */
  phase?: EcgPhaseInfo
}

/**
 * Compact cascade of leads sampled from the ECG Generator.
 * Waveforms come from activation → vector → body surface → leads.
 */
export default function EcgMiniMonitor({
  sample,
  elapsed,
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
      lastTRef.current = elapsed
      setTick((n) => n + 1)
      return
    }

    const samplePeriod = 1 / FS
    let t = lastTRef.current
    let wrote = false
    while (t + samplePeriod <= elapsed + 1e-9) {
      t += samplePeriod
      pushEcgSample(stream, { ...sample, t })
      wrote = true
    }
    if (wrote) {
      lastTRef.current = t
      setTick((n) => n + 1)
    }
  }, [elapsed, sample])

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
            {phaseBadge(phase.phase)}
          </span>
        )}
      </div>
      {phase && (
        <p className="ecg-mini-sync" title={phase.label}>
          {phaseSyncHint(phase)}
        </p>
      )}
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

function phaseBadge(phase: EcgPhaseInfo['phase']): string {
  switch (phase) {
    case 'p_wave':
      return 'P'
    case 'qrs':
      return 'QRS'
    case 't_wave':
      return 'T'
    case 'st_segment':
      return 'ST'
    default:
      return '—'
  }
}

function phaseSyncHint(phase: EcgPhaseInfo): string {
  switch (phase.drivenBy) {
    case 'atrial_activation':
      return 'Synced: atrial activation → P wave'
    case 'ventricular_depolarization':
      return 'Synced: ventricular depol. → QRS'
    case 'repolarization':
      return 'Synced: repolarization → T wave'
    case 'st_window':
      return 'ST window after QRS'
    default:
      return 'Waiting for next activation'
  }
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
  const scaleY = 18
  const mid = 32
  let d = ''
  for (let i = 0; i < count; i++) {
    const idx = (start + i) % n
    const x = (i / (count - 1)) * (CAPACITY - 1)
    const y = mid - samples[idx]! * scaleY
    d +=
      i === 0
        ? `M ${x.toFixed(1)} ${y.toFixed(1)}`
        : ` L ${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}
