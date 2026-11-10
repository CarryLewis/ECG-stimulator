import type { DiseaseDefinition, DiseaseParamDef } from '../../disease/types'
import {
  PATHOLOGY_SCENARIOS,
  SCENARIO_EXTRA_PARAMS,
} from '../../disease/scenarios'
import { useLanguage, type LocalizedString } from '../../i18n'

interface PathologyPanelProps {
  scenarioId: string
  onScenarioChange: (id: string) => void
  disease: DiseaseDefinition
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
  params,
  onParamChange,
}: PathologyPanelProps) {
  const { t, L } = useLanguage()
  const extra = SCENARIO_EXTRA_PARAMS[scenarioId] ?? []
  const packParams = [...extra, ...disease.params]

  return (
    <section className="anatomy-section pathology-section">
      <label className="anatomy-control">
        <span className="anatomy-section-title">{t('pathology')}</span>
        <select className="pathology-select" value={scenarioId}
          onChange={(e) => onScenarioChange(e.target.value)}>
          {PATHOLOGY_SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>{L(s.name)}</option>
          ))}
        </select>
      </label>
      {packParams.length > 0 && (
        <details className="learning-details">
          <summary>{t('scenarioParameters')}</summary>
          {packParams.map((p) => (
            <ParamControl key={p.key} param={p}
              value={params[p.key] ?? p.default} onChange={onParamChange} />
          ))}
        </details>
      )}
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
