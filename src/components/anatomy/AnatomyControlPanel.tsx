import type { ReactNode } from 'react'
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
  timeScale: number
  onTimeScaleChange: (scale: number) => void
  rateBpm: number
  onRateChange: (bpm: number) => void
  /** Optional pathology / disease controls rendered after the header. */
  pathologySlot?: ReactNode
}

const SPEED_PRESETS = [
  { label: 'Slow', value: 0.2 },
  { label: 'Learn', value: 0.35 },
  { label: 'Clear', value: 0.5 },
  { label: 'Real', value: 1 },
]

export default function AnatomyControlPanel({
  heartVersion,
  onHeartVersionChange,
  selectedId,
  myocardiumOpacity,
  showLabels,
  onSelect,
  onOpacityChange,
  onToggleLabels,
  timeScale,
  onTimeScaleChange,
  rateBpm,
  pathologySlot,
}: AnatomyControlPanelProps) {
  const selected = selectedId
    ? HEART_STRUCTURES.find((s) => s.id === selectedId)
    : null
  const versionMeta = HEART_VERSIONS.find((v) => v.id === heartVersion)

  return (
    <aside className="anatomy-panel">
      <header className="anatomy-panel-header">
        <p className="anatomy-eyebrow">生理源模型</p>
        <h1 className="anatomy-title">病理心电仿真</h1>
        <p className="anatomy-lede">
          疾病包修改电生理模型；三维激动与十二导联由同一偶极子采样，而不是手动画波形。
        </p>
      </header>

      {pathologySlot}

      <section className="anatomy-section">
        <h2 className="anatomy-section-title">Playback</h2>
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>Time scale</span>
            <span className="anatomy-control-value">
              ×{timeScale.toFixed(2)}
            </span>
          </span>
          <input
            type="range"
            min={0.15}
            max={1}
            step={0.05}
            value={timeScale}
            onChange={(e) => onTimeScaleChange(Number(e.target.value))}
          />
        </label>
        <div className="speed-presets" role="group" aria-label="Pace presets">
          {SPEED_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={
                'speed-preset' +
                (Math.abs(timeScale - p.value) < 0.01
                  ? ' speed-preset--active'
                  : '')
              }
              onClick={() => onTimeScaleChange(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="anatomy-control">
          <span className="anatomy-control-row">
            <span>Ventricular rate</span>
            <span className="anatomy-control-value">
              {Math.round(rateBpm)} bpm
            </span>
          </span>
          <p className="anatomy-version-hint">
            Rate follows the active disease plan (edit scenario parameters).
          </p>
        </div>
      </section>

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
            Select a pathology above, then watch conduction glow and the
            12-lead ECG update from the same physiological model.
          </p>
        )}
      </section>
    </aside>
  )
}
