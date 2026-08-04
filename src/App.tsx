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
  // Drop scenario-only keys that the pack may not define.
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

  // Shared simulation clock — views do not animate on their own.
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
      // Remap disease when territory / degree changes.
      const s = PATHOLOGY_SCENARIO_BY_ID[scenarioId]
      if (s?.remapDiseaseId) {
        const newId = s.remapDiseaseId(next)
        if (newId !== diseaseId) {
          const remapped = buildParams(scenarioId, newId, next)
          return remapped
        }
      }
      return next
    })
  }

  return (
    <div className="app app--pathology">
      <AnatomyControlPanel
        heartVersion={heartVersion}
        onHeartVersionChange={setHeartVersion}
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
          /* Rate is driven by the disease plan; keep prop for UI display. */
        }}
        pathologySlot={
          <PathologyPanel
            scenarioId={scenarioId}
            onScenarioChange={handleScenarioChange}
            disease={disease}
            scenario={scenario}
            params={params}
            onParamChange={handleParamChange}
            locale="zh"
          />
        }
      />
      <div className="pathology-workspace">
        <main className="anatomy-stage">
          <CardiacAnatomyViewport
            heartVersion={heartVersion}
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
            <span>{disease.name.zh}</span>
            <span>·</span>
            <span>{frame.state.status}</span>
            <span>·</span>
            <span>{Math.round(rateBpm)} bpm</span>
            {result.model.injuryCurrentEnabled && (
              <>
                <span>·</span>
                <span>损伤电流</span>
              </>
            )}
          </div>
        </main>
        <section className="ecg-stage" aria-label="12-lead ECG">
          <header className="ecg-stage-header">
            <h2>十二导联心电图</h2>
            <p>
              {disease.ecgManifestations.morphology.zh} · 25 mm/s · 10 mm/mV
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

// Ensure registry is warm even if tree-shaken imports rearrange.
void getDisease('normal_sinus_rhythm')
