/**
 * Twelve-lead ECG paper-style display.
 * Consumes a generated EcgStrip — no physiology here.
 */

import { useMemo } from 'react'
import type { EcgStrip, LeadName } from '../simulation/types'
import { LEAD_ORDER } from '../simulation/types'

const PRINT_GRID: LeadName[][] = [
  ['I', 'aVR', 'V1', 'V4'],
  ['II', 'aVL', 'V2', 'V5'],
  ['III', 'aVF', 'V3', 'V6'],
]

interface TwelveLeadDisplayProps {
  strip: EcgStrip
  selectedLead: LeadName | null
  onSelectLead?: (lead: LeadName | null) => void
  /** Seconds of signal shown per panel cell. */
  window_s?: number
  height?: number
}

function buildPath(
  samples: Float32Array,
  fs: number,
  window_s: number,
  width: number,
  height: number,
  mVPerPixel: number,
): string {
  const n = Math.min(samples.length, Math.floor(window_s * fs))
  if (n < 2) return ''
  const dx = width / (n - 1)
  const mid = height / 2
  let d = ''
  for (let i = 0; i < n; i++) {
    const x = i * dx
    const y = mid - samples[i] * mVPerPixel
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d
}

function LeadCell({
  lead,
  samples,
  fs,
  window_s,
  selected,
  onSelect,
}: {
  lead: LeadName
  samples: Float32Array
  fs: number
  window_s: number
  selected: boolean
  onSelect?: (lead: LeadName) => void
}) {
  const W = 220
  const H = 96
  // Teaching gain: ~0.25 mV P ≈ 7 px; ~1.5 mV R ≈ 42 px (still on-scale).
  const mVPerPixel = 28
  const path = useMemo(
    () => buildPath(samples, fs, window_s, W, H, mVPerPixel),
    [samples, fs, window_s],
  )

  return (
    <button
      type="button"
      className={'ecg-lead-cell' + (selected ? ' ecg-lead-cell--selected' : '')}
      onClick={() => onSelect?.(lead)}
      aria-pressed={selected}
      aria-label={`Lead ${lead}`}
    >
      <span className="ecg-lead-label">{lead}</span>
      <svg
        className="ecg-lead-svg"
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-hidden
      >
        <defs>
          <pattern
            id={`ecg-grid-${lead}`}
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 22 0 L 0 0 0 22"
              fill="none"
              stroke="rgba(220, 80, 80, 0.12)"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#ecg-grid-${lead})`} />
        <line
          x1={0}
          x2={W}
          y1={H / 2}
          y2={H / 2}
          stroke="rgba(220, 80, 80, 0.2)"
          strokeWidth="0.7"
        />
        <path d={path} fill="none" stroke="#111827" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </button>
  )
}

export default function TwelveLeadDisplay({
  strip,
  selectedLead,
  onSelectLead,
  window_s = 2.0,
}: TwelveLeadDisplayProps) {
  return (
    <div className="ecg-twelve" role="region" aria-label="Twelve-lead ECG">
      <div className="ecg-twelve-header">
        <h2 className="ecg-panel-title">12-lead ECG</h2>
        <p className="ecg-panel-meta">
          {strip.intervals.rate_bpm} bpm · PR{' '}
          {Math.round(strip.intervals.pr_s * 1000)} ms · QRS{' '}
          {Math.round(strip.intervals.qrs_s * 1000)} ms · QT{' '}
          {Math.round(strip.intervals.qt_s * 1000)} ms
        </p>
      </div>
      <div className="ecg-twelve-grid">
        {PRINT_GRID.map((row, ri) => (
          <div key={ri} className="ecg-twelve-row">
            {row.map((lead) => (
              <LeadCell
                key={lead}
                lead={lead}
                samples={strip.leads[lead]}
                fs={strip.fs}
                window_s={window_s}
                selected={selectedLead === lead}
                onSelect={(l) =>
                  onSelectLead?.(selectedLead === l ? null : l)
                }
              />
            ))}
          </div>
        ))}
      </div>
      <p className="ecg-twelve-footnote">
        All leads are projections of one cardiac vector M(t). Order:{' '}
        {LEAD_ORDER.join(' · ')}
      </p>
    </div>
  )
}
