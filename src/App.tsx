import { useState } from 'react'
import type { HeartStructureId } from './anatomy/types'
import type { HeartVersion } from './anatomy/heartVersions'
import type { LeadName } from './ecg/types'
import AnatomyControlPanel from './components/anatomy/AnatomyControlPanel'
import CardiacAnatomyViewport from './components/anatomy/CardiacAnatomyViewport'
import EcgMonitor from './components/ecg/EcgMonitor'
import { useTransportClock } from './recording/useTransportClock'
import { useSimulationFrame } from './sim/useSimulationFrame'
import { DEFAULT_HEART_RATE_BPM } from './sim/sinusTiming'
import { DEFAULT_TIME_SCALE } from './sim/useSimulationClock'

const DEFAULT_OPACITY = 0.95

export default function App() {
  const [heartVersion, setHeartVersion] = useState<HeartVersion>('anatomy')
  const [selectedId, setSelectedId] = useState<HeartStructureId | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadName | null>('II')
  const [myocardiumOpacity, setMyocardiumOpacity] = useState(DEFAULT_OPACITY)
  const [showLabels, setShowLabels] = useState(true)
  const [rateBpm, setRateBpm] = useState(DEFAULT_HEART_RATE_BPM)

  // Shared transport clock — anatomy + ECG recorder subscribe; no independent timelines.
  const clock = useTransportClock('sinus', DEFAULT_TIME_SCALE)
  const frame = useSimulationFrame(clock.elapsed, rateBpm)

  return (
    <div className="app app--with-ecg">
      <AnatomyControlPanel
        heartVersion={heartVersion}
        onHeartVersionChange={setHeartVersion}
        selectedId={selectedId}
        myocardiumOpacity={myocardiumOpacity}
        showLabels={showLabels}
        onSelect={setSelectedId}
        onOpacityChange={setMyocardiumOpacity}
        onToggleLabels={setShowLabels}
        timeScale={clock.timeScale}
        onTimeScaleChange={clock.setTimeScale}
        rateBpm={rateBpm}
        onRateChange={setRateBpm}
      />
      <div className="workspace">
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
            timeScale={clock.timeScale}
            rateBpm={rateBpm}
          />
        </main>
        <EcgMonitor
          clock={clock}
          rateBpm={rateBpm}
          selectedLead={selectedLead}
          onSelectedLeadChange={setSelectedLead}
        />
      </div>
    </div>
  )
}
