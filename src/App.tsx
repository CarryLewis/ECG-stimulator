import { useMemo, useState } from 'react'
import type { HeartStructureId } from './anatomy/types'
import type { HeartVersion } from './anatomy/heartVersions'
import type { LeadName } from './ecg/types'
import CardiacAnatomyViewport from './components/anatomy/CardiacAnatomyViewport'
import LabHeader from './components/lab/LabHeader'
import TimelinePanel from './components/lab/TimelinePanel'
import ClinicalPanel from './components/lab/ClinicalPanel'
import EcgGrid from './components/ecg/EcgGrid'
import EcgMonitor from './components/ecg/EcgMonitor'
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
import { clearIrregularBeatCache } from './ecg/beats'
import { useLanguage } from './i18n'
import { useTransportClock } from './recording/useTransportClock'
import { useSimulationFrame } from './sim/useSimulationFrame'
import { DEFAULT_TIME_SCALE } from './sim/useSimulationClock'

const DEFAULT_OPACITY = 0.92
const DEFAULT_SCENARIO = 'nsr'

type EcgViewMode = 'pathology_grid' | 'recording'

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
  const scenario =
    PATHOLOGY_SCENARIO_BY_ID[scenarioId] ?? PATHOLOGY_SCENARIOS[0]!
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
  const [heartVersion, setHeartVersion] = useState<HeartVersion>('vector')
  const [selectedId, setSelectedId] = useState<HeartStructureId | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadName | null>('II')
  const [myocardiumOpacity, setMyocardiumOpacity] = useState(DEFAULT_OPACITY)
  const [showLabels, setShowLabels] = useState(true)
  const [ecgView, setEcgView] = useState<EcgViewMode>('pathology_grid')

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

  // Shared transport clock — anatomy glow + ECG acquisition share one timeline.
  const clock = useTransportClock('sinus', DEFAULT_TIME_SCALE)
  const frame = useSimulationFrame(clock.elapsed, plan, rateBpm)

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

  const phaseLabel =
    frame.ecgPhase.phase === 'isoelectric'
      ? 'Rest'
      : frame.ecgPhase.phase === 'p_wave'
        ? 'P wave'
        : frame.ecgPhase.phase === 'qrs'
          ? 'QRS'
          : frame.ecgPhase.phase === 't_wave'
            ? 'T wave'
            : 'ST'

  const statusLine = L(frame.state.status)

  return (
    <div className="lab-app lab-app--consolidated" lang={locale}>
      <LabHeader
        heartVersion={heartVersion}
        onHeartVersionChange={setHeartVersion}
        rateBpm={rateBpm}
        elapsed={frame.t}
        timeScale={clock.timeScale}
        phaseLabel={phaseLabel}
      />

      <div className="lab-body">
        <main className="lab-stage" aria-label="Interactive 3D heart">
          <CardiacAnatomyViewport
            heartVersion={heartVersion}
            selectedStructureId={selectedId}
            onSelectStructure={setSelectedId}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
            myocardiumOpacity={myocardiumOpacity}
            showLabels={showLabels}
            conduction={frame.state}
            field={frame.field}
            axis={frame.axis}
            activationIntensity={frame.activationIntensity}
          />
          <div className="pathology-status-bar lab-status-bar" aria-live="polite">
            <span>{L(disease.name)}</span>
            <span>·</span>
            <span>{statusLine}</span>
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

        <aside className="lab-rail" aria-label="Laboratory panels">
          <section className="lab-panel lab-panel--ecg" aria-label="ECG monitor">
            <header className="lab-panel-head">
              <div>
                <h2 className="lab-panel-title">{t('ecgTitle')}</h2>
                <p className="lab-panel-sub">
                  {L(disease.ecgManifestations.morphology)}
                </p>
              </div>
              <div className="lab-ecg-mode" role="group" aria-label="ECG view">
                <button
                  type="button"
                  className={
                    ecgView === 'pathology_grid'
                      ? 'lab-ecg-mode-btn lab-ecg-mode-btn--active'
                      : 'lab-ecg-mode-btn'
                  }
                  onClick={() => setEcgView('pathology_grid')}
                >
                  12-lead
                </button>
                <button
                  type="button"
                  className={
                    ecgView === 'recording'
                      ? 'lab-ecg-mode-btn lab-ecg-mode-btn--active'
                      : 'lab-ecg-mode-btn'
                  }
                  onClick={() => setEcgView('recording')}
                >
                  Record
                </button>
              </div>
            </header>
            {ecgView === 'pathology_grid' ? (
              <EcgGrid
                plan={plan}
                elapsed={frame.t}
                afSeed={plan.rhythmSeed || 23}
                resetKey={`${scenarioId}:${diseaseId}:${JSON.stringify(params)}`}
              />
            ) : (
              <EcgMonitor
                clock={clock}
                rateBpm={rateBpm}
                selectedLead={selectedLead}
                onSelectedLeadChange={setSelectedLead}
              />
            )}
          </section>

          <TimelinePanel
            phaseMs={frame.phaseMs}
            active={frame.active}
            status={statusLine}
            timeScale={clock.timeScale}
            onTimeScaleChange={clock.setTimeScale}
            rateBpm={rateBpm}
            onRateChange={() => {
              /* Rate is driven by the disease plan. */
            }}
          />

          <ClinicalPanel
            heartVersion={heartVersion}
            selectedId={selectedId}
            onSelect={setSelectedId}
            myocardiumOpacity={myocardiumOpacity}
            onOpacityChange={setMyocardiumOpacity}
            showLabels={showLabels}
            onToggleLabels={setShowLabels}
            phase={frame.ecgPhase}
            active={frame.active}
            axis={frame.axis}
            field={frame.field}
            activationIntensity={frame.activationIntensity}
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
        </aside>
      </div>
    </div>
  )
}

void getDisease('normal_sinus_rhythm')
