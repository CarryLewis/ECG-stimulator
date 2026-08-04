import type { DiseaseDefinition, DiseaseParamDef, LocalizedString } from '../../disease/types'
import {
  PATHOLOGY_SCENARIOS,
  SCENARIO_EXTRA_PARAMS,
  type PathologyScenario,
} from '../../disease/scenarios'

type Locale = 'en' | 'zh'

interface PathologyPanelProps {
  scenarioId: string
  onScenarioChange: (id: string) => void
  disease: DiseaseDefinition
  scenario: PathologyScenario
  params: Record<string, number | string | boolean>
  onParamChange: (key: string, value: number | string) => void
  locale?: Locale
}

function L(text: LocalizedString, locale: Locale): string {
  return locale === 'zh' ? text.zh : text.en
}

/**
 * Scenario picker + disease parameter controls for the six pathology families.
 */
export default function PathologyPanel({
  scenarioId,
  onScenarioChange,
  disease,
  scenario,
  params,
  onParamChange,
  locale = 'zh',
}: PathologyPanelProps) {
  const extra = SCENARIO_EXTRA_PARAMS[scenarioId] ?? []
  const packParams = disease.params

  return (
    <section className="anatomy-section pathology-section">
      <h2 className="anatomy-section-title">
        {locale === 'zh' ? '病理情景' : 'Pathology'}
      </h2>
      <p className="anatomy-version-hint">
        {locale === 'zh'
          ? '疾病改变生理模型；十二导联与心脏激动由同一偶极子采样。'
          : 'Disease packs modify physiology; ECG and heart glow share one dipole.'}
      </p>

      <div className="pathology-list" role="listbox" aria-label="Pathology scenarios">
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
              <span className="pathology-btn-name">{L(s.name, locale)}</span>
              <span className="pathology-btn-short">{L(s.short, locale)}</span>
            </button>
          )
        })}
      </div>

      <div className="pathology-explain">
        <p className="pathology-explain-summary">
          {L(disease.clinical.summary, locale)}
        </p>
        <ul className="pathology-explain-findings">
          {disease.ecgManifestations.keyFindings.slice(0, 3).map((f, i) => (
            <li key={i}>{L(f, locale)}</li>
          ))}
        </ul>
      </div>

      {[...extra, ...packParams].map((p) => (
        <ParamControl
          key={p.key}
          param={p}
          value={params[p.key] ?? p.default}
          onChange={onParamChange}
          locale={locale}
        />
      ))}

      <p className="anatomy-version-hint pathology-trace">
        <strong>{locale === 'zh' ? '传导路径' : 'Pathway'}:</strong>{' '}
        {L(scenario.short, locale)}
      </p>
    </section>
  )
}

function ParamControl({
  param,
  value,
  onChange,
  locale,
}: {
  param: DiseaseParamDef | (typeof SCENARIO_EXTRA_PARAMS)[string][number]
  value: number | string | boolean
  onChange: (key: string, value: number | string) => void
  locale: Locale
}) {
  if (param.kind === 'select' && param.options) {
    return (
      <label className="anatomy-control">
        <span className="anatomy-control-row">
          <span>{L(param.label, locale)}</span>
        </span>
        <select
          className="pathology-select"
          value={String(value)}
          onChange={(e) => onChange(param.key, e.target.value)}
        >
          {param.options.map((o) => (
            <option key={o.value} value={o.value}>
              {L(o.label, locale)}
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
        <span>{L(param.label, locale)}</span>
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
