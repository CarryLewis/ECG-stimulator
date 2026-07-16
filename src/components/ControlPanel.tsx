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
}

export default function ControlPanel({
  disease,
  params,
  onSelectDisease,
  onParamChange,
}: ControlPanelProps) {
  return (
    <div className="panel control-panel">
      <h2 className="panel-title">Scenario</h2>
      <p className="panel-hint">
        Pick a physiological state, then adjust the parameters to see the 12-lead
        ECG and conduction change in real time.
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
