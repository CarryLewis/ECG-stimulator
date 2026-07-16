import { useId } from 'react'
import type { LeadTrace } from '../ecg/types'

interface EcgLeadProps {
  trace: LeadTrace
  fs: number
  duration: number
  /** Height of the drawing box in px (viewBox units). */
  height?: number
}

/** 1 mm expressed in px for the ECG grid (drives 25 mm/s and 10 mm/mV). */
const MM = 4.8
const PX_PER_S = 25 * MM
const PX_PER_MV = 10 * MM

export default function EcgLead({
  trace,
  fs,
  duration,
  height = 130,
}: EcgLeadProps) {
  const gid = useId().replace(/:/g, '')
  const width = duration * PX_PER_S
  const baseline = height / 2

  let d = ''
  for (let i = 0; i < trace.samples.length; i++) {
    const x = (i / fs) * PX_PER_S
    const y = baseline - trace.samples[i] * PX_PER_MV
    d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' '
  }

  return (
    <svg
      className="ecg-lead"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Lead ${trace.name} ECG trace`}
    >
      <defs>
        <pattern
          id={`small-${gid}`}
          width={MM}
          height={MM}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${MM} 0 L 0 0 0 ${MM}`}
            fill="none"
            stroke="#f4cfd6"
            strokeWidth="0.5"
          />
        </pattern>
        <pattern
          id={`big-${gid}`}
          width={MM * 5}
          height={MM * 5}
          patternUnits="userSpaceOnUse"
        >
          <rect width={MM * 5} height={MM * 5} fill={`url(#small-${gid})`} />
          <path
            d={`M ${MM * 5} 0 L 0 0 0 ${MM * 5}`}
            fill="none"
            stroke="#e79aa6"
            strokeWidth="0.9"
          />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#big-${gid})`} />
      <path
        d={d}
        fill="none"
        stroke="#111827"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <text x="6" y="18" className="ecg-lead-label">
        {trace.name}
      </text>
    </svg>
  )
}
