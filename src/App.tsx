import { useMemo, useState } from 'react'
import { HEART_STRUCTURES } from './anatomy/heartStructures'
import type { HeartStructureId } from './anatomy/types'
import type { HeartVersion } from './anatomy/heartVersions'
import type { LeadName } from './ecg/types'
import AnatomyControlPanel from './components/anatomy/AnatomyControlPanel'
import CardiacAnatomyViewport from './components/anatomy/CardiacAnatomyViewport'
import ConductionTimeline from './components/anatomy/ConductionTimeline'
import HeartVersionToggle from './components/anatomy/HeartVersionToggle'
import { OrientationLegend } from './components/OrientationCube'
import EcgGrid from './components/ecg/EcgGrid'
import PathologyPanel from './components/pathology/PathologyPanel'
import {
  defaultParamsFor,
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
import { conductionAt } from './ecg/conduction'
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
  return { disease, result, plan, diseaseId }
}

export default function App() {
  const { t, L, locale } = useLanguage()
  const [heartVersion, setHeartVersion] = useState<HeartVersion>('v1')
  const [selectedId, setSelectedId] = useState<HeartStructureId | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadName | null>(null)
  const [myocardiumOpacity, setMyocardiumOpacity] = useState(DEFAULT_OPACITY)
  const [showLabels, setShowLabels] = useState(true)
  const [timeScale, setTimeScale] = useState(DEFAULT_TIME_SCALE)
  const [playing, setPlaying] = useState(true)

  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO)
  const [params, setParams] = useState<DiseaseParamValues>(() => {
    const s = PATHOLOGY_SCENARIO_BY_ID[DEFAULT_SCENARIO]!
    return buildParams(DEFAULT_SCENARIO, s.diseaseId)
  })

  const { disease, result, plan, diseaseId } = useMemo(
    () => resolveScenario(scenarioId, params),
    [scenarioId, params],
  )

  const elapsed = useSimulationClock('simulation', timeScale, playing)
  const conduction = conductionAt(plan, elapsed, { afSeed: plan.rhythmSeed || 23 })
  const selectedStructure = HEART_STRUCTURES.find((s) => s.id === selectedId)
  const rate = plan.ventricularFibrillation
    ? t('rateNotMeasurable')
    : `${t('ventricularRate')} · ${Math.round(plan.ventricularRate)} bpm`
  const completeBlock = result.model.avBlock === 'third'
  const intermittentBlock = result.model.avBlock === 'second_type1'
    || result.model.avBlock === 'second_type2'
  const focusLead = disease.ecgManifestations.leadEmphasis?.[0] ?? 'II'
  const showConductionPath = !plan.ventricularFibrillation && !plan.ventricularFlutter
    && !plan.fibrillatoryBaseline && !plan.flutterBaseline && !intermittentBlock

  function selectStructure(id: HeartStructureId | null) {
    setSelectedId(id)
    if (id) {
      setHeartVersion('anatomy')
      setSelectedLead(null)
    }
  }

  function changeView(view: HeartVersion) {
    setHeartVersion(view)
    if (view !== 'anatomy') setSelectedId(null)
  }

  const handleScenarioChange = (id: string) => {
    const s = PATHOLOGY_SCENARIO_BY_ID[id]
    if (!s || id === scenarioId) return
    setSelectedLead(null)
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
        onSelect={selectStructure}
        onOpacityChange={setMyocardiumOpacity}
        onToggleLabels={setShowLabels}
        canAdjustOpacity={heartVersion === 'anatomy'}
        pathologySlot={
          <PathologyPanel
            scenarioId={scenarioId}
            onScenarioChange={handleScenarioChange}
            disease={disease}
            params={params}
            onParamChange={handleParamChange}
          />
        }
        learningSlot={
          <>
            <header className="simulation-toolbar">
              <div>
                <h2>{L(disease.name)}</h2>
                <p>{rate}</p>
              </div>
              <div className="simulation-playback" role="group" aria-label={t('playback')}>
                <label>
                  <span>{t('timeScale')} · ×{timeScale.toFixed(2)}</span>
                  <input type="range" min={0.15} max={1} step={0.05} value={timeScale}
                    onChange={(e) => setTimeScale(Number(e.target.value))} />
                </label>
                <button type="button" className="playback-button" onClick={() => setPlaying(!playing)}>
                  {playing ? t('pause') : t('resume')}
                </button>
                <span className="playback-state" role="status">{playing ? t('playing') : t('paused')}</span>
              </div>
            </header>
            <div className="heart-viewer-toolbar">
              <HeartVersionToggle heartVersion={heartVersion} onHeartVersionChange={changeView} />
              <OrientationLegend />
            </div>
            <p className="activation-key">{t('activationKey')}</p>
            <div className="ecg-stage-header">
              <h2>{t('observe')}</h2>
              <p>{L(disease.ecgManifestations.morphology)}</p>
            </div>
            <p className="sidebar-status">{L(conduction.status)}</p>
            <ConductionTimeline plan={plan} state={conduction} intermittentBlock={intermittentBlock} />
            {selectedStructure && (
              <div className="selection-detail" role="status">
                <strong>{L(selectedStructure.label)} · {selectedStructure.abbr}</strong>
                <p>{L(selectedStructure.description)}</p>
              </div>
            )}
          </>
        }
      />
      <main className="pathology-workspace">
        <div className="anatomy-stage">
          <CardiacAnatomyViewport
            heartVersion={heartVersion}
            selectedStructureId={selectedId}
            onSelectStructure={selectStructure}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
            myocardiumOpacity={myocardiumOpacity}
            showLabels={showLabels}
            conduction={conduction}
            showConductionPath={showConductionPath}
            completeBlock={completeBlock}
          />
        </div>
        <section className="ecg-stage" aria-label={t('ecgStage')}>
          <EcgGrid
            key={`${scenarioId}:${diseaseId}:${JSON.stringify(params)}`}
            plan={plan}
            elapsed={elapsed}
            focusLead={focusLead}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
          />
        </section>
      </main>
    </div>
  )
}
