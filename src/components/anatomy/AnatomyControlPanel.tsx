import { HEART_STRUCTURES } from '../../anatomy/heartStructures'
import {
  HEART_VERSIONS,
  type HeartVersion,
} from '../../anatomy/heartVersions'
import type { HeartStructureId } from '../../anatomy/types'

interface AnatomyControlPanelProps {
  heartVersion: HeartVersion
  onHeartVersionChange: (v: HeartVersion) => void
  selectedId: HeartStructureId | null
  myocardiumOpacity: number
  showLabels: boolean
  onSelect: (id: HeartStructureId | null) => void
  onOpacityChange: (opacity: number) => void
  onToggleLabels: (show: boolean) => void
}

export default function AnatomyControlPanel({
  heartVersion,
  onHeartVersionChange,
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
  const versionMeta = HEART_VERSIONS.find((v) => v.id === heartVersion)

  return (
    <aside className="anatomy-panel">
      <header className="anatomy-panel-header">
        <p className="anatomy-eyebrow">Source model</p>
        <h1 className="anatomy-title">Cardiac anatomy</h1>
        <p className="anatomy-lede">
          Three teaching views of the same biological heart. The orientation
          cube (A/P/L/R/H/B) tracks camera rotation on every version.
        </p>
      </header>

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">Heart version</h2>
        <div
          className="heart-version-toggle"
          role="group"
          aria-label="Heart model version"
        >
          {HEART_VERSIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={
                'heart-version-btn' +
                (heartVersion === v.id ? ' heart-version-btn--active' : '')
              }
              onClick={() => onHeartVersionChange(v.id)}
            >
              {v.short}
            </button>
          ))}
        </div>
        {versionMeta && (
          <p className="anatomy-version-hint">
            <strong>{versionMeta.title}</strong> — {versionMeta.hint}
          </p>
        )}
      </section>

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
        <p className="anatomy-version-hint">
          Opacity applies to the chamber source mesh when used; V1–V3 use their
          own translucent materials. Labels: V1 node tags / V2 pins / V3
          electrodes.
        </p>
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
            Select a structure for a clinical note, or click a lead pin /
            electrode in V2–V3. Use the cube faces to snap to anatomical views.
          </p>
        )}
      </section>
    </aside>
  )
}
