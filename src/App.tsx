import { useState } from 'react'
import type { HeartStructureId } from './anatomy/types'
import type { HeartVersion } from './anatomy/heartVersions'
import type { LeadName } from './ecg/types'
import AnatomyControlPanel from './components/anatomy/AnatomyControlPanel'
import CardiacAnatomyViewport from './components/anatomy/CardiacAnatomyViewport'

const DEFAULT_OPACITY = 0.72

export default function App() {
  const [heartVersion, setHeartVersion] = useState<HeartVersion>('v1')
  const [selectedId, setSelectedId] = useState<HeartStructureId | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadName | null>(null)
  const [myocardiumOpacity, setMyocardiumOpacity] = useState(DEFAULT_OPACITY)
  const [showLabels, setShowLabels] = useState(true)

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
      />
      <main className="anatomy-stage">
        <CardiacAnatomyViewport
          heartVersion={heartVersion}
          selectedLead={selectedLead}
          onSelectLead={setSelectedLead}
          showLabels={showLabels}
        />
      </main>
    </div>
  )
}
