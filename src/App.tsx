import { useMemo, useState } from 'react'
import type { HeartStructureId } from './anatomy/types'
import type { HeartVersion } from './anatomy/heartVersions'
import type { LeadName } from './ecg/types'
import AnatomyControlPanel from './components/anatomy/AnatomyControlPanel'
import CardiacAnatomyViewport from './components/anatomy/CardiacAnatomyViewport'
import EcgGrid from './components/ecg/EcgGrid'
import PathologyPanel from './components/pathology/PathologyPanel'
import {
  defaultParamsFor,
  getDisease,
  physiologicalModelToCyclePlan,
  requireDisease,
  resolveDiseaseSimulation,
  PATHOLOGY_SCENARIO_BY_ID,
  PATHOLOGY_SCENARIOS,
  SCENARIO_EXTRA_PARAMS,
  type DiseaseParamValues,
} from './disease'
import { useLanguage } from './i18n'
import {
  DEFAULT_TIME_SCALE,
  useSimulationClock,
} from './sim/useSimulationClock'
import { useSimulationFrame } from './sim/useSimulationFrame'
import { clearIrregularBeatCache } from './ecg/beats'

const DEFAULT_OPACITY = 0.95
const DEFAULT_SCENARIO = 'nsr'

function buildParams(
  scenarioId: string,
  diseaseId: string,
  overrides: DiseaseParamValues = {},
): DiseaseParamValues {
  const disease = requireDisease(diseaseId)
  const base = { ...defaultParamsFor(disease) }
  const extras = SCENARIO_EXTRA_PARAMS[scenarioId] ?? []
  for (const p of extras) {
    if (!(p.key in base)) base[p.key] = p.default
  }
  return { ...base, ...overrides }
}

function resolveScenario(scenarioId: string, params: DiseaseParamValues) {
  const scenario = PATHOLOGY_SCENARIO_BY_ID[scenarioId] ?? PATHOLOGY_SCENARIOS[0]!
  const diseaseId = scenario.remapDiseaseId?.(params) ?? scenario.diseaseId
  const disease = requireDisease(diseaseId)
  const packKeys = new Set(disease.params.map((p) => p.key))
  const packParamsMutable: Record<string, number | string | boolean> = {}
  for (const [k, v] of Object.entries(params)) {
    if (packKeys.has(k)) packParamsMutable[k] = v
  }
  const result = resolveDiseaseSimulation({
    diseaseId,
    params: packParamsMutable,
  })
  const plan = physiologicalModelToCyclePlan(result.model)
  return { scenario, disease, result, plan, diseaseId }
}

export default function App() {
  const { t, L, locale } = useLanguage()
  const [heartVersion, setHeartVersion] = useState<HeartVersion>('v1')
  const [selectedId, setSelectedId] = useState<HeartStructureId | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadName | null>(null)
  const [myocardiumOpacity, setMyocardiumOpacity] = useState(DEFAULT_OPACITY)
  const [showLabels, setShowLabels] = useState(true)
  const [timeScale, setTimeScale] = useState(DEFAULT_TIME_SCALE)

  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO)
  const [params, setParams] = useState<DiseaseParamValues>(() => {
    const s = PATHOLOGY_SCENARIO_BY_ID[DEFAULT_SCENARIO]!
    return buildParams(DEFAULT_SCENARIO, s.diseaseId)
  })

  const { scenario, disease, result, plan, diseaseId } = useMemo(
    () => resolveScenario(scenarioId, params),
    [scenarioId, params],
  )

  const rateBpm = plan.ventricularRate

  const elapsed = useSimulationClock('sinus', timeScale)
  const frame = useSimulationFrame(elapsed, plan, rateBpm)

  const handleScenarioChange = (id: string) => {
    const s = PATHOLOGY_SCENARIO_BY_ID[id]
    if (!s) return
    clearIrregularBeatCache()
    setScenarioId(id)
    setParams(buildParams(id, s.diseaseId))
  }

  const handleParamChange = (key: string, value: number | string) => {
    clearIrregularBeatCache()
    setParams((prev) => {
      const next = { ...prev, [key]: value }
      const s = PATHOLOGY_SCENARIO_BY_ID[scenarioId]
      if (s?.remapDiseaseId) {
        const newId = s.remapDiseaseId(next)
        if (newId !== diseaseId) {
          return buildParams(scenarioId, newId, next)
        }
      }
      return next
    })
  }

  return (
    <div className="app app--pathology" lang={locale}>
      <AnatomyControlPanel
        selectedId={selectedId}
        myocardiumOpacity={myocardiumOpacity}
        showLabels={showLabels}
        onSelect={setSelectedId}
        onOpacityChange={setMyocardiumOpacity}
        onToggleLabels={setShowLabels}
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        rateBpm={rateBpm}
        onRateChange={() => {
          /* Rate is driven by the disease plan. */
        }}
        pathologySlot={
          <PathologyPanel
            scenarioId={scenarioId}
            onScenarioChange={handleScenarioChange}
            disease={disease}
            scenario={scenario}
            params={params}
            onParamChange={handleParamChange}
          />
        }
      />
      <div className="pathology-workspace">
        <main className="anatomy-stage">
          <CardiacAnatomyViewport
            heartVersion={heartVersion}
            onHeartVersionChange={setHeartVersion}
            selectedStructureId={selectedId}
            onSelectStructure={setSelectedId}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
            myocardiumOpacity={myocardiumOpacity}
            showLabels={showLabels}
            conduction={frame.state}
            activeEvent={frame.active}
            phaseMs={frame.phaseMs}
            elapsed={frame.t}
            timeScale={timeScale}
            rateBpm={rateBpm}
          />
          <div className="pathology-status-bar" aria-live="polite">
            <span>{L(disease.name)}</span>
            <span>·</span>
            <span>{L(frame.state.status)}</span>
            <span>·</span>
            <span>{Math.round(rateBpm)} bpm</span>
            {result.model.injuryCurrentEnabled && (
              <>
                <span>·</span>
                <span>{t('injuryCurrent')}</span>
              </>
            )}
          </div>
        </main>
        <section className="ecg-stage" aria-label={t('ecgStage')}>
          <header className="ecg-stage-header">
            <h2>{t('ecgTitle')}</h2>
            <p>
              {L(disease.ecgManifestations.morphology)} · {t('calibration')}
            </p>
          </header>
          <EcgGrid
            plan={plan}
            elapsed={frame.t}
            afSeed={plan.rhythmSeed || 23}
            resetKey={`${scenarioId}:${diseaseId}:${JSON.stringify(params)}`}
          />
        </section>
      </div>
    </div>
  )
}

void getDisease('normal_sinus_rhythm')
