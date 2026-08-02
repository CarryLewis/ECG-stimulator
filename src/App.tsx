import { useCallback, useState } from 'react'
import type { HeartStructureId } from './anatomy/types'
import type { HeartVersion } from './anatomy/heartVersions'
import type { LeadName } from './ecg/types'
import AnatomyControlPanel from './components/anatomy/AnatomyControlPanel'
import CardiacAnatomyViewport from './components/anatomy/CardiacAnatomyViewport'
import {
  DEFAULT_TIME_SCALE,
  useSimulationClock,
} from './sim/useSimulationClock'
import { useSimulationFrame } from './sim/useSimulationFrame'
import { DEFAULT_HEART_RATE_BPM } from './sim/sinusTiming'
import {
  DEFAULT_SIM_PARAMS,
  usePhysiologicalEcg,
  type SimulationParams,
} from './simulation'
import { ECGMonitor, TwelveLeadDisplay } from './visualization'

const DEFAULT_OPACITY = 0.95

export default function App() {
  const [heartVersion, setHeartVersion] = useState<HeartVersion>('anatomy')
  const [selectedId, setSelectedId] = useState<HeartStructureId | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadName | null>(null)
  const [myocardiumOpacity, setMyocardiumOpacity] = useState(DEFAULT_OPACITY)
  const [showLabels, setShowLabels] = useState(true)
  const [timeScale, setTimeScale] = useState(DEFAULT_TIME_SCALE)
  const [rateBpm, setRateBpm] = useState(DEFAULT_HEART_RATE_BPM)
  const [simParams, setSimParams] = useState<SimulationParams>({
    ...DEFAULT_SIM_PARAMS,
    heartRate_bpm: DEFAULT_HEART_RATE_BPM,
  })

  const onSimParamsChange = useCallback((patch: Partial<SimulationParams>) => {
    setSimParams((prev) => {
      const next = { ...prev, ...patch }
      if (patch.heartRate_bpm != null) setRateBpm(patch.heartRate_bpm)
      return next
    })
  }, [])

  const onRateChange = useCallback((bpm: number) => {
    setRateBpm(bpm)
    setSimParams((prev) => ({ ...prev, heartRate_bpm: bpm }))
  }, [])

  // Shared simulation clock — views do not animate on their own.
  const elapsed = useSimulationClock('sinus', timeScale)
  const frame = useSimulationFrame(elapsed, rateBpm, simParams)
  const { strip, validation, field } = usePhysiologicalEcg(simParams, elapsed)

  return (
    <div className="app">
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
        onRateChange={onRateChange}
        simParams={simParams}
        onSimParamsChange={onSimParamsChange}
        validation={validation}
      />
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
          dipole={field.dipole}
        />
        <section className="ecg-dock" aria-label="ECG output">
          <ECGMonitor
            strip={strip}
            lead={selectedLead ?? 'II'}
            playhead_s={elapsed % strip.duration_s}
          />
          <TwelveLeadDisplay
            strip={strip}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
          />
        </section>
      </main>
    </div>
  )
}
