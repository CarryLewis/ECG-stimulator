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
import {
  DEFAULT_TIME_SCALE,
  useSimulationClock,
} from './hooks/useSimulationClock'

/** Shared seed so AF irregular RR matches across ECG + conduction. */
const AF_SEED = 23

export default function App() {
  const [diseaseId, setDiseaseId] = useState<string>(DISEASES[0].id)
  const [paramsById, setParamsById] = useState<Record<string, ParamValues>>(() =>
    Object.fromEntries(DISEASES.map((d) => [d.id, defaultParams(d)])),
  )
  const [timeScale, setTimeScale] = useState(DEFAULT_TIME_SCALE)

  const disease = DISEASE_BY_ID[diseaseId]
  const params = paramsById[diseaseId]

  const plan = useMemo(() => disease.buildPlan(params), [disease, params])

  // Shared slowed clock: ECG sweep and conduction glow stay phase-locked.
  const elapsed = useSimulationClock(diseaseId, timeScale)

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
              Cardiac dipole → 12-lead projection, locked to a slowed conduction
              timeline so each activation step is easy to see.
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
            timeScale={timeScale}
            onTimeScaleChange={setTimeScale}
          />
        </aside>

        <section className="app-col app-col--center">
          <div className="panel ecg-panel">
            <div className="ecg-header">
              <h2 className="panel-title">Bedside ECG Monitor</h2>
              <span className="ecg-calibration">
                Sweep · t = {elapsed.toFixed(1)} s · ×{timeScale.toFixed(2)}
              </span>
            </div>
            <EcgGrid
              plan={plan}
              elapsed={elapsed}
              afSeed={AF_SEED}
              resetKey={diseaseId}
              timeScale={timeScale}
            />
          </div>
        </section>

        <aside className="app-col app-col--right">
          <ConductionModel
            plan={plan}
            elapsed={elapsed}
            afSeed={AF_SEED}
            timeScale={timeScale}
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
