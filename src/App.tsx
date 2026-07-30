import { useState } from 'react'
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

const DEFAULT_OPACITY = 0.72

export default function App() {
  const [heartVersion, setHeartVersion] = useState<HeartVersion>('v1')
  const [selectedId, setSelectedId] = useState<HeartStructureId | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadName | null>(null)
  const [myocardiumOpacity, setMyocardiumOpacity] = useState(DEFAULT_OPACITY)
  const [showLabels, setShowLabels] = useState(true)
  const [timeScale, setTimeScale] = useState(DEFAULT_TIME_SCALE)
  const [rateBpm, setRateBpm] = useState(DEFAULT_HEART_RATE_BPM)

  // Shared simulation clock — views do not animate on their own.
  const elapsed = useSimulationClock('sinus', timeScale)
  const frame = useSimulationFrame(elapsed, rateBpm)

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
        onRateChange={setRateBpm}
      />
      <main className="anatomy-stage">
        <CardiacAnatomyViewport
          heartVersion={heartVersion}
          selectedLead={selectedLead}
          onSelectLead={setSelectedLead}
          showLabels={showLabels}
          conduction={frame.state}
          activeEvent={frame.active}
          phaseMs={frame.phaseMs}
          elapsed={frame.t}
          timeScale={timeScale}
          rateBpm={rateBpm}
        />
      </main>
    </div>
  )
}
