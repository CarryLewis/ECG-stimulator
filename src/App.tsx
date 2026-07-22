import { useMemo, useState } from 'react'
import ControlPanel from './components/ControlPanel'
import EcgGrid from './components/EcgGrid'
import ConductionModel from './components/ConductionModel'
import ExplanationPanel from './components/ExplanationPanel'
import {
  DISEASE_BY_ID,
  DISEASES,
  defaultParams,
  type ParamValues,
} from './ecg/diseases'
import { useSimulationClock } from './hooks/useSimulationClock'

/** Shared seed so AF irregular RR matches across ECG + conduction. */
const AF_SEED = 23

export default function App() {
  const [diseaseId, setDiseaseId] = useState<string>(DISEASES[0].id)
  const [paramsById, setParamsById] = useState<Record<string, ParamValues>>(() =>
    Object.fromEntries(DISEASES.map((d) => [d.id, defaultParams(d)])),
  )

  const disease = DISEASE_BY_ID[diseaseId]
  const params = paramsById[diseaseId]

  const plan = useMemo(() => disease.buildPlan(params), [disease, params])

  // One shared clock drives both the live 12-lead monitor and the conduction
  // diagram so P/QRS/T line up with SA → AV → His → ventricle activation.
  // Reset only when the disease changes; parameter tweaks keep the timeline.
  const elapsed = useSimulationClock(diseaseId)

  const handleParamChange = (key: string, value: number | string) => {
    setParamsById((prev) => ({
      ...prev,
      [diseaseId]: { ...prev[diseaseId], [key]: value },
    }))
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-logo" aria-hidden>
            {'\u2764'}
          </span>
          <div>
            <h1>ECG Learning Simulator</h1>
            <p>
              Real-time cardiac dipole → 12-lead projection, locked to the
              conduction timeline — from ion channels to the surface ECG.
            </p>
          </div>
        </div>
      </header>

      <main className="app-layout">
        <aside className="app-col app-col--left">
          <ControlPanel
            disease={disease}
            params={params}
            onSelectDisease={setDiseaseId}
            onParamChange={handleParamChange}
          />
        </aside>

        <section className="app-col app-col--center">
          <div className="panel ecg-panel">
            <div className="ecg-header">
              <h2 className="panel-title">Bedside ECG Monitor</h2>
              <span className="ecg-calibration">
                Sweep · t = {elapsed.toFixed(1)} s
              </span>
            </div>
            <EcgGrid
              plan={plan}
              elapsed={elapsed}
              afSeed={AF_SEED}
              resetKey={diseaseId}
            />
          </div>
        </section>

        <aside className="app-col app-col--right">
          <ConductionModel
            plan={plan}
            elapsed={elapsed}
            afSeed={AF_SEED}
          />
          <ExplanationPanel disease={disease} params={params} />
        </aside>
      </main>

      <footer className="app-footer">
        Educational simulation only — waveforms are synthesised from a cardiac
        dipole model and must not be used for clinical diagnosis.
      </footer>
    </div>
  )
}
