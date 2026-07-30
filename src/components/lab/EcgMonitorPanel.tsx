import { useEffect, useMemo, useRef, useState } from 'react'
import type { EcgPhaseInfo, EcgSample } from '../../ecg-generator'
import { createEcgStream, pushEcgSample } from '../../ecg-generator'
import { LEAD_ORDER } from '../../vector-engine'
import type { LeadName } from '../../ecg/types'

const FS = 250
const DURATION = 3.2
const CAPACITY = Math.ceil(FS * DURATION)
const DISPLAY_LEADS: LeadName[] = ['I', 'II', 'III', 'aVF', 'V1', 'V5']

interface EcgMonitorPanelProps {
  sample: EcgSample
  elapsed: number
  phase: EcgPhaseInfo
  leadI: number
  leadII: number
  leadAVF: number
}

/**
 * Laboratory ECG monitor — waveforms from the physiological pipeline only.
 */
export default function EcgMonitorPanel({
  sample,
  elapsed,
  phase,
  leadI,
  leadII,
  leadAVF,
}: EcgMonitorPanelProps) {
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

  return (
    <section className="lab-panel" aria-label="ECG monitor">
      <header className="lab-panel-head">
        <div>
          <h2 className="lab-panel-title">ECG monitor</h2>
          <p className="lab-panel-sub">
            Surface leads · 25 mm/s equiv. · from cardiac dipole
          </p>
        </div>
        <span className={`lab-phase-tag lab-phase-tag--${phase.phase}`}>
          {phaseShort(phase.phase)}
        </span>
      </header>

      <p className="lab-phase-hint">{phase.label}</p>

      <div className="lab-ecg-grid">
        {paths.map(({ lead, d }) => (
          <div key={lead} className="lab-ecg-row">
            <span className="lab-ecg-lead">{lead}</span>
            <svg
              className="lab-ecg-svg"
              viewBox={`0 0 ${CAPACITY} 56`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`Lead ${lead}`}
            >
              <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        ))}
      </div>

      <dl className="lab-ecg-readout">
        <div>
          <dt>I</dt>
          <dd>{leadI.toFixed(2)} mV</dd>
        </div>
        <div>
          <dt>II</dt>
          <dd>{leadII.toFixed(2)} mV</dd>
        </div>
        <div>
          <dt>aVF</dt>
          <dd>{leadAVF.toFixed(2)} mV</dd>
        </div>
      </dl>
    </section>
  )
}

function phaseShort(phase: EcgPhaseInfo['phase']): string {
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
      return 'ISO'
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
  const scaleY = 14
  const mid = 28
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
