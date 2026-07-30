import { HEART_STRUCTURES } from '../../anatomy/heartStructures'
import type { HeartStructureId } from '../../anatomy/types'

interface AnatomyControlPanelProps {
  selectedId: HeartStructureId | null
  myocardiumOpacity: number
  showLabels: boolean
  onSelect: (id: HeartStructureId | null) => void
  onOpacityChange: (opacity: number) => void
  onToggleLabels: (show: boolean) => void
}

export default function AnatomyControlPanel({
  selectedId,
  myocardiumOpacity,
  showLabels,
  onSelect,
  onOpacityChange,
  onToggleLabels,
}: AnatomyControlPanelProps) {
  const selected = selectedId
    ? HEART_STRUCTURES.find((s) => s.id === selectedId)
    : null

  return (
    <aside className="anatomy-panel">
      <header className="anatomy-panel-header">
        <p className="anatomy-eyebrow">Source model</p>
        <h1 className="anatomy-title">Cardiac anatomy</h1>
        <p className="anatomy-lede">
          Macroscopic chambers and walls that will drive conduction and ECG
          generation. Select a structure to inspect it.
        </p>
      </header>

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">Display</h2>
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>Myocardium opacity</span>
            <span className="anatomy-control-value">
              {Math.round(myocardiumOpacity * 100)}%
            </span>
          </span>
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.05}
            value={myocardiumOpacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
          />
        </label>
        <label className="anatomy-toggle">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => onToggleLabels(e.target.checked)}
          />
          <span>Anatomical labels</span>
        </label>
      </section>

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">Structures</h2>
        <ul className="structure-list" role="listbox" aria-label="Heart structures">
          {HEART_STRUCTURES.map((s) => {
            const active = selectedId === s.id
            return (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={
                    'structure-btn' + (active ? ' structure-btn--active' : '')
                  }
                  style={{ ['--swatch' as string]: s.color }}
                  onClick={() => onSelect(active ? null : s.id)}
                >
                  <span className="structure-swatch" />
                  <span className="structure-btn-text">
                    <span className="structure-abbr">{s.abbr}</span>
                    <span className="structure-name">{s.label.en}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="anatomy-section anatomy-detail">
        <h2 className="anatomy-section-title">
          {selected ? selected.label.en : 'Selection'}
        </h2>
        {selected ? (
          <>
            <p className="anatomy-detail-abbr">{selected.abbr}</p>
            <p className="anatomy-detail-body">{selected.description.en}</p>
          </>
        ) : (
          <p className="anatomy-detail-body anatomy-detail-body--muted">
            Click a chamber, the septum, or the apex in the viewport — or use
            the list above.
          </p>
        )}
      </section>
    </aside>
  )
}
