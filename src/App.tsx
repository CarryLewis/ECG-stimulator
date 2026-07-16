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
import { generateEcg } from './ecg/generator'

export default function App() {
  const [diseaseId, setDiseaseId] = useState<string>(DISEASES[0].id)
  const [paramsById, setParamsById] = useState<Record<string, ParamValues>>(() =>
    Object.fromEntries(DISEASES.map((d) => [d.id, defaultParams(d)])),
  )

  const disease = DISEASE_BY_ID[diseaseId]
  const params = paramsById[diseaseId]

  const plan = useMemo(() => disease.buildPlan(params), [disease, params])

  const gridEcg = useMemo(
    () => generateEcg(plan, { duration: 2.5, seed: 7 }),
    [plan],
  )
  const stripEcg = useMemo(
    () => generateEcg(plan, { duration: 10, seed: 23, leads: ['II'] }),
    [plan],
  )

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
              Interactive physiology &amp; 12-lead ECG for medical students —
              from ion channels to the surface ECG.
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
              <h2 className="panel-title">12-Lead ECG</h2>
              <span className="ecg-calibration">25 mm/s &middot; 10 mm/mV</span>
            </div>
            <EcgGrid ecg={gridEcg} strip={stripEcg} />
          </div>
        </section>

        <aside className="app-col app-col--right">
          <ConductionModel plan={plan} />
          <ExplanationPanel disease={disease} params={params} />
        </aside>
      </main>

      <footer className="app-footer">
        Educational simulation only — waveforms are synthesised models and must
        not be used for clinical diagnosis.
      </footer>
    </div>
  )
}
