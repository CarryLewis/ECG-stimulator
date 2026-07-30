/**
 * Single-lead cascade / rhythm monitor.
 * Displays a generated lead buffer — physiology stays in /simulation.
 */

import { useMemo } from 'react'
import type { EcgStrip, LeadName } from '../simulation/types'

interface ECGMonitorProps {
  strip: EcgStrip
  lead?: LeadName
  /** Live playhead time (absolute seconds), optional sweep marker. */
  playhead_s?: number
  height?: number
  title?: string
}

export default function ECGMonitor({
  strip,
  lead = 'II',
  playhead_s,
  height = 140,
  title = 'Rhythm (Lead II)',
}: ECGMonitorProps) {
  const W = 640
  const samples = strip.leads[lead]
  const mVPerPixel = 36

  const path = useMemo(() => {
    const n = samples.length
    if (n < 2) return ''
    const dx = W / (n - 1)
    const mid = height / 2
    let d = ''
    for (let i = 0; i < n; i++) {
      const x = i * dx
      const y = mid - samples[i] * mVPerPixel
      d +=
        i === 0
          ? `M ${x.toFixed(2)} ${y.toFixed(2)}`
          : ` L ${x.toFixed(2)} ${y.toFixed(2)}`
    }
    return d
  }, [samples, height])

  const playheadX =
    playhead_s != null
      ? ((playhead_s - strip.t0) / strip.duration_s) * W
      : null

  return (
    <div className="ecg-monitor" role="region" aria-label={title}>
      <div className="ecg-monitor-header">
        <h2 className="ecg-panel-title">{title}</h2>
        <span className="ecg-monitor-lead">{lead}</span>
      </div>
      <svg
        className="ecg-monitor-svg"
        viewBox={`0 0 ${W} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={`${lead} waveform`}
      >
        <defs>
          <pattern
            id="ecg-monitor-grid"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 16 0 L 0 0 0 16"
              fill="none"
              stroke="rgba(61, 184, 168, 0.12)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width={W} height={height} fill="url(#ecg-monitor-grid)" />
        <line
          x1={0}
          x2={W}
          y1={height / 2}
          y2={height / 2}
          stroke="rgba(61, 184, 168, 0.25)"
          strokeWidth="0.8"
        />
        <path d={path} fill="none" stroke="#5eead4" strokeWidth="1.6" />
        {playheadX != null && playheadX >= 0 && playheadX <= W && (
          <line
            x1={playheadX}
            x2={playheadX}
            y1={0}
            y2={height}
            stroke="rgba(255, 220, 120, 0.85)"
            strokeWidth="1.2"
          />
        )}
      </svg>
    </div>
  )
}
