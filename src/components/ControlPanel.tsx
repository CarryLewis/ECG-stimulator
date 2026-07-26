import {
  DISEASES,
  type Disease,
  type ParamValues,
} from '../ecg/diseases'

interface ControlPanelProps {
  disease: Disease
  params: ParamValues
  onSelectDisease: (id: string) => void
  onParamChange: (key: string, value: number | string) => void
  timeScale: number
  onTimeScaleChange: (scale: number) => void
}

const SPEED_PRESETS = [
  { label: 'Slow', value: 0.2 },
  { label: 'Learn', value: 0.35 },
  { label: 'Clear', value: 0.5 },
  { label: 'Real', value: 1 },
] as const

export default function ControlPanel({
  disease,
  params,
  onSelectDisease,
  onParamChange,
  timeScale,
  onTimeScaleChange,
}: ControlPanelProps) {
  const pct = Math.round(timeScale * 100)

  return (
    <div className="panel control-panel">
      <h2 className="panel-title">Scenario</h2>
      <p className="panel-hint">
        Pick a physiological state, then adjust parameters. Conduction and ECG
        share one clock — slowed so SA → AV → His → ventricle is easy to follow.
      </p>

      <div className="disease-list">
        {DISEASES.map((d) => (
          <button
            key={d.id}
            type="button"
            className={
              'disease-btn' + (d.id === disease.id ? ' disease-btn--active' : '')
            }
            onClick={() => onSelectDisease(d.id)}
          >
            <span className="disease-btn-name">{d.name}</span>
            <span className="disease-btn-cat">{d.category}</span>
          </button>
        ))}
      </div>

      <h2 className="panel-title">Playback pace</h2>
      <p className="panel-hint">
        Real cardiac timing flashes by in &lt;1 s. Slow the shared clock so the
        eye can track each conduction step (ECG stays locked).
      </p>
      <div className="param-list">
        <label className="param">
          <span className="param-row">
            <span className="param-label">Time scale</span>
            <span className="param-value">
              {pct}
              <span className="param-unit"> % real-time</span>
            </span>
          </span>
          <input
            type="range"
            min={0.15}
            max={1}
            step={0.05}
            value={timeScale}
            onChange={(e) => onTimeScaleChange(Number(e.target.value))}
          />
        </label>
        <div className="speed-presets" role="group" aria-label="Pace presets">
          {SPEED_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={
                'speed-preset' +
                (Math.abs(timeScale - p.value) < 0.01
                  ? ' speed-preset--active'
                  : '')
              }
              onClick={() => onTimeScaleChange(p.value)}
            >
              {p.label}
              <span className="speed-preset-meta">×{p.value}</span>
            </button>
          ))}
        </div>
      </div>

      <h2 className="panel-title">Parameters</h2>
      <div className="param-list">
        {disease.params.map((p) => {
          const value = params[p.key]
          if (p.type === 'select') {
            return (
              <label key={p.key} className="param param--select">
                <span className="param-label">{p.label}</span>
                <select
                  value={String(value)}
                  onChange={(e) => onParamChange(p.key, e.target.value)}
                >
                  {p.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            )
          }

          const num = typeof value === 'number' ? value : Number(value)
          const isFloat = (p.step ?? 1) < 1
          return (
            <label key={p.key} className="param">
              <span className="param-row">
                <span className="param-label">{p.label}</span>
                <span className="param-value">
                  {isFloat ? num.toFixed(p.unit === 's' ? 2 : 1) : Math.round(num)}
                  <span className="param-unit"> {p.unit}</span>
                </span>
              </span>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={num}
                onChange={(e) => onParamChange(p.key, Number(e.target.value))}
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}
