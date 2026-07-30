import { useState } from 'react'
import type { HeartStructureId } from './anatomy/types'
import type { HeartVersion } from './anatomy/heartVersions'
import type { LeadName } from './ecg/types'
import CardiacAnatomyViewport from './components/anatomy/CardiacAnatomyViewport'
import LabHeader from './components/lab/LabHeader'
import EcgMonitorPanel from './components/lab/EcgMonitorPanel'
import TimelinePanel from './components/lab/TimelinePanel'
import ClinicalPanel from './components/lab/ClinicalPanel'
import {
  DEFAULT_TIME_SCALE,
  useSimulationClock,
} from './sim/useSimulationClock'
import { useSimulationFrame } from './sim/useSimulationFrame'
import { DEFAULT_HEART_RATE_BPM } from './sim/sinusTiming'

const DEFAULT_OPACITY = 0.92

export default function App() {
  const [heartVersion, setHeartVersion] = useState<HeartVersion>('vector')
  const [selectedId, setSelectedId] = useState<HeartStructureId | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadName | null>(null)
  const [myocardiumOpacity, setMyocardiumOpacity] = useState(DEFAULT_OPACITY)
  const [showLabels, setShowLabels] = useState(true)
  const [timeScale, setTimeScale] = useState(DEFAULT_TIME_SCALE)
  const [rateBpm, setRateBpm] = useState(DEFAULT_HEART_RATE_BPM)

  const elapsed = useSimulationClock('sinus', timeScale)
  const frame = useSimulationFrame(elapsed, rateBpm)

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

  return (
    <div className="lab-app">
      <LabHeader
        heartVersion={heartVersion}
        onHeartVersionChange={setHeartVersion}
        rateBpm={rateBpm}
        elapsed={frame.t}
        timeScale={timeScale}
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
        </main>

        <aside className="lab-rail" aria-label="Laboratory panels">
          <EcgMonitorPanel
            sample={frame.ecg}
            elapsed={frame.t}
            phase={frame.ecgPhase}
            leadI={frame.leads.leads.I}
            leadII={frame.leads.leads.II}
            leadAVF={frame.leads.leads.aVF}
          />
          <TimelinePanel
            phaseMs={frame.phaseMs}
            active={frame.active}
            status={frame.state.status}
            timeScale={timeScale}
            onTimeScaleChange={setTimeScale}
            rateBpm={rateBpm}
            onRateChange={setRateBpm}
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
          />
        </aside>
      </div>
    </div>
  )
}
