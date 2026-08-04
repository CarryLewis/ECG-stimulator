import type { DiseaseDefinition, DiseaseParamDef } from '../../disease/types'
import {
  PATHOLOGY_SCENARIOS,
  SCENARIO_EXTRA_PARAMS,
  type PathologyScenario,
} from '../../disease/scenarios'
import { useLanguage, type LocalizedString } from '../../i18n'

interface PathologyPanelProps {
  scenarioId: string
  onScenarioChange: (id: string) => void
  disease: DiseaseDefinition
  scenario: PathologyScenario
  params: Record<string, number | string | boolean>
  onParamChange: (key: string, value: number | string) => void
}

/**
 * Scenario picker + disease parameter controls for the pathology families.
 */
export default function PathologyPanel({
  scenarioId,
  onScenarioChange,
  disease,
  scenario,
  params,
  onParamChange,
}: PathologyPanelProps) {
  const { t, L } = useLanguage()
  const extra = SCENARIO_EXTRA_PARAMS[scenarioId] ?? []
  const packParams = disease.params

  return (
    <section className="anatomy-section pathology-section">
      <h2 className="anatomy-section-title">{t('pathology')}</h2>
      <p className="anatomy-version-hint">{t('pathologyHint')}</p>

      <div
        className="pathology-list"
        role="listbox"
        aria-label={t('pathologyScenarios')}
      >
        {PATHOLOGY_SCENARIOS.map((s) => {
          const active = scenarioId === s.id
          return (
            <button
              key={s.id}
              type="button"
              role="option"
              aria-selected={active}
              className={
                'pathology-btn' + (active ? ' pathology-btn--active' : '')
              }
              onClick={() => onScenarioChange(s.id)}
            >
              <span className="pathology-btn-name">{L(s.name)}</span>
              <span className="pathology-btn-short">{L(s.short)}</span>
            </button>
          )
        })}
      </div>

      <div className="pathology-explain">
        <p className="pathology-explain-summary">
          {L(disease.clinical.summary)}
        </p>
        <ul className="pathology-explain-findings">
          {disease.ecgManifestations.keyFindings.slice(0, 3).map((f, i) => (
            <li key={i}>{L(f)}</li>
          ))}
        </ul>
      </div>

      {[...extra, ...packParams].map((p) => (
        <ParamControl
          key={p.key}
          param={p}
          value={params[p.key] ?? p.default}
          onChange={onParamChange}
        />
      ))}

      <p className="anatomy-version-hint pathology-trace">
        <strong>{t('pathway')}:</strong> {L(scenario.short)}
      </p>
    </section>
  )
}

function ParamControl({
  param,
  value,
  onChange,
}: {
  param: DiseaseParamDef | (typeof SCENARIO_EXTRA_PARAMS)[string][number]
  value: number | string | boolean
  onChange: (key: string, value: number | string) => void
}) {
  const { L } = useLanguage()

  if (param.kind === 'select' && param.options) {
    return (
      <label className="anatomy-control">
        <span className="anatomy-control-row">
          <span>{L(param.label as LocalizedString)}</span>
        </span>
        <select
          className="pathology-select"
          value={String(value)}
          onChange={(e) => onChange(param.key, e.target.value)}
        >
          {param.options.map((o) => (
            <option key={o.value} value={o.value}>
              {L(o.label as LocalizedString)}
            </option>
          ))}
        </select>
      </label>
    )
  }

  const numVal = typeof value === 'number' ? value : Number(param.default)
  return (
    <label className="anatomy-control">
      <span className="anatomy-control-row">
        <span>{L(param.label as LocalizedString)}</span>
        <span className="anatomy-control-value">
          {numVal}
          {param.unit ? ` ${param.unit}` : ''}
        </span>
      </span>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={numVal}
        onChange={(e) => onChange(param.key, Number(e.target.value))}
      />
    </label>
  )
}
