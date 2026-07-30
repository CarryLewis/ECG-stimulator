import { useState } from 'react'
import type { HeartStructureId } from './anatomy/types'
import AnatomyControlPanel from './components/anatomy/AnatomyControlPanel'
import CardiacAnatomyViewport from './components/anatomy/CardiacAnatomyViewport'

const DEFAULT_OPACITY = 0.72

export default function App() {
  const [selectedId, setSelectedId] = useState<HeartStructureId | null>(null)
  const [myocardiumOpacity, setMyocardiumOpacity] = useState(DEFAULT_OPACITY)
  const [showLabels, setShowLabels] = useState(true)

  return (
    <div className="app">
      <AnatomyControlPanel
        selectedId={selectedId}
        myocardiumOpacity={myocardiumOpacity}
        showLabels={showLabels}
        onSelect={setSelectedId}
        onOpacityChange={setMyocardiumOpacity}
        onToggleLabels={setShowLabels}
      />
      <main className="anatomy-stage">
        <CardiacAnatomyViewport
          selectedId={selectedId}
          myocardiumOpacity={myocardiumOpacity}
          showLabels={showLabels}
          onSelect={setSelectedId}
        />
      </main>
    </div>
  )
}
