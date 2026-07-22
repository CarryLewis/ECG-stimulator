import { conductionAt } from '../ecg/conduction'
import type { CyclePlan } from '../ecg/types'

interface ConductionModelProps {
  plan: CyclePlan
  elapsed: number
  afSeed?: number
}

const IDLE_STROKE = '#3b4a63'
const ACCENT = [52, 211, 153] // emerald
const BLOCK = '#f87171'

/** Blend the idle colour toward the emerald accent by t in [0,1]. */
function glow(t: number): string {
  const c = Math.max(0, Math.min(1, t))
  const r = Math.round(31 + (ACCENT[0] - 31) * c)
  const g = Math.round(43 + (ACCENT[1] - 43) * c)
  const b = Math.round(62 + (ACCENT[2] - 62) * c)
  return `rgb(${r}, ${g}, ${b})`
}

export default function ConductionModel({
  plan,
  elapsed,
  afSeed = 23,
}: ConductionModelProps) {
  const state = conductionAt(plan, elapsed, { afSeed })

  return (
    <div className="panel conduction-panel">
      <h2 className="panel-title">Cardiac Electrical Conduction</h2>
      <svg
        className="conduction-svg"
        viewBox="0 0 320 360"
        role="img"
        aria-label="Animated cardiac conduction model"
      >
        <ellipse
          cx="112"
          cy="112"
          rx="72"
          ry="56"
          fill={glow(state.atria)}
          stroke={IDLE_STROKE}
          strokeWidth="2"
        />
        <ellipse
          cx="212"
          cy="112"
          rx="70"
          ry="56"
          fill={glow(state.atria)}
          stroke={IDLE_STROKE}
          strokeWidth="2"
        />
        <path
          d="M40 180 Q40 320 112 335 Q170 322 168 200 Z"
          fill={glow(state.ventricle)}
          stroke={IDLE_STROKE}
          strokeWidth="2"
        />
        <path
          d="M282 180 Q282 330 205 340 Q150 326 152 200 Z"
          fill={glow(state.ventricle)}
          stroke={IDLE_STROKE}
          strokeWidth="2"
        />

        <line
          x1="160"
          y1="168"
          x2="160"
          y2="200"
          stroke={glow(state.his)}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M160 200 Q120 250 108 312"
          fill="none"
          stroke={glow(state.bundle)}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M160 200 Q205 250 214 316"
          fill="none"
          stroke={glow(state.bundle)}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M108 312 q-18 6 -30 20 M108 312 q6 14 -2 30 M108 312 q18 8 26 22"
          fill="none"
          stroke={glow(state.ventricle)}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M214 316 q18 6 30 20 M214 316 q-6 14 2 30 M214 316 q-18 8 -26 22"
          fill="none"
          stroke={glow(state.ventricle)}
          strokeWidth="2"
          strokeLinecap="round"
        />

        <circle
          cx="166"
          cy="70"
          r="9"
          fill={glow(state.sa)}
          stroke="#eaf2ff"
          strokeWidth="1.5"
        />
        <circle
          cx="160"
          cy="162"
          r="10"
          fill={state.avConducts ? glow(state.av) : BLOCK}
          stroke="#eaf2ff"
          strokeWidth="1.5"
        />
        {!state.avConducts && (
          <g stroke={BLOCK} strokeWidth="3" strokeLinecap="round">
            <line x1="150" y1="178" x2="170" y2="192" />
            <line x1="170" y1="178" x2="150" y2="192" />
          </g>
        )}

        <g className="conduction-label">
          <text x="182" y="66">
            SA node
          </text>
          <text x="176" y="158">
            AV node
          </text>
          <text x="168" y="192">
            His bundle
          </text>
          <text x="8" y="150">
            Atria
          </text>
          <text x="8" y="300">
            Ventricles
          </text>
          <text x="70" y="352">
            Bundle branches
          </text>
          <text x="196" y="352">
            Purkinje
          </text>
        </g>
      </svg>
      <div className="conduction-status">{state.status}</div>
      <div className="conduction-legend">
        <span className="legend-dot legend-dot--idle" /> Resting
        <span className="legend-dot legend-dot--active" /> Depolarising
      </div>
    </div>
  )
}
