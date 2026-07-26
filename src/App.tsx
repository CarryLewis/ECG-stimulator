import { useMemo, useState } from 'react'
import ControlPanel from './components/ControlPanel'
import EcgGrid from './components/EcgGrid'
import ConductionModel, {
  type HeartVersion,
} from './components/ConductionModel'
import ExplanationPanel from './components/ExplanationPanel'
import LanguageToggle from './components/LanguageToggle'
import {
  DISEASE_BY_ID,
  DISEASES,
  defaultParams,
  type ParamValues,
} from './ecg/diseases'
import type { LeadName } from './ecg/types'
import { useLanguage } from './i18n/useLanguage'
import {
  DEFAULT_TIME_SCALE,
  useSimulationClock,
} from './hooks/useSimulationClock'

/** Shared seed so AF irregular RR matches across ECG + conduction. */
const AF_SEED = 23

export default function App() {
  const { t } = useLanguage()
  const [diseaseId, setDiseaseId] = useState<string>(DISEASES[0].id)
  const [paramsById, setParamsById] = useState<Record<string, ParamValues>>(() =>
    Object.fromEntries(DISEASES.map((d) => [d.id, defaultParams(d)])),
  )
  const [timeScale, setTimeScale] = useState(DEFAULT_TIME_SCALE)
  const [heartVersion, setHeartVersion] = useState<HeartVersion>('v2')
  const [selectedLead, setSelectedLead] = useState<LeadName | null>(null)

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
            <h1>{t('appTitle')}</h1>
            <p>{t('appSubtitle')}</p>
          </div>
        </div>
        <LanguageToggle />
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
              <h2 className="panel-title">{t('bedsideMonitor')}</h2>
              <span className="ecg-calibration">
                {t('sweepPrefix')} · t = {elapsed.toFixed(1)} s · ×
                {timeScale.toFixed(2)}
                {selectedLead ? ` · ${selectedLead}` : ''}
              </span>
            </div>
            <EcgGrid
              plan={plan}
              elapsed={elapsed}
              afSeed={AF_SEED}
              resetKey={diseaseId}
              timeScale={timeScale}
              selectedLead={selectedLead}
              onSelectLead={setSelectedLead}
            />
          </div>
        </section>

        <aside className="app-col app-col--right">
          <ConductionModel
            plan={plan}
            elapsed={elapsed}
            afSeed={AF_SEED}
            timeScale={timeScale}
            heartVersion={heartVersion}
            onHeartVersionChange={setHeartVersion}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
          />
          <ExplanationPanel disease={disease} params={params} />
        </aside>
      </main>

      <footer className="app-footer">{t('footer')}</footer>
    </div>
  )
}
