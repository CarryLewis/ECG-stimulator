import { HEART_STRUCTURES } from '../../anatomy/heartStructures'
import {
  HEART_VERSIONS,
  type HeartVersion,
} from '../../anatomy/heartVersions'
import type { HeartStructureId } from '../../anatomy/types'
import {
  ELECTRODE_SITES,
  type ElectrodeSite,
} from '../../ecg/electrodeMap'
import type { LeadName } from '../../ecg/types'
import { useLanguage } from '../../i18n/useLanguage'

interface AnatomyControlPanelProps {
  heartVersion: HeartVersion
  onHeartVersionChange: (v: HeartVersion) => void
  selectedId: HeartStructureId | null
  selectedLead: LeadName | null
  myocardiumOpacity: number
  showLabels: boolean
  onSelect: (id: HeartStructureId | null) => void
  onSelectLead: (lead: LeadName | null) => void
  onOpacityChange: (opacity: number) => void
  onToggleLabels: (show: boolean) => void
  timeScale: number
  onTimeScaleChange: (scale: number) => void
  rateBpm: number
  onRateChange: (bpm: number) => void
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
  selectedLead,
  myocardiumOpacity,
  showLabels,
  onSelect,
  onSelectLead,
  onOpacityChange,
  onToggleLabels,
  timeScale,
  onTimeScaleChange,
  rateBpm,
  onRateChange,
}: AnatomyControlPanelProps) {
  const { locale } = useLanguage()
  const selected = selectedId
    ? HEART_STRUCTURES.find((s) => s.id === selectedId)
    : null
  const versionMeta = HEART_VERSIONS.find((v) => v.id === heartVersion)
  const isV3 = heartVersion === 'v3'
  const selectedElectrode = isV3
    ? ELECTRODE_SITES.find(
        (e) => selectedLead !== null && e.leads.includes(selectedLead),
      )
    : null

  return (
    <aside className="anatomy-panel">
      <header className="anatomy-panel-header">
        <p className="anatomy-eyebrow">Source model</p>
        <h1 className="anatomy-title">Cardiac anatomy</h1>
        <p className="anatomy-lede">
          Conduction glow is driven by physiological events from the simulation
          clock (SA → atria → AV → His → bundles → Purkinje → repolarization).
        </p>
      </header>

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
        <label className="anatomy-control">
          <span className="anatomy-control-row">
            <span>Heart rate</span>
            <span className="anatomy-control-value">{rateBpm} bpm</span>
          </span>
          <input
            type="range"
            min={40}
            max={140}
            step={1}
            value={rateBpm}
            onChange={(e) => onRateChange(Number(e.target.value))}
          />
        </label>
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

      {isV3 && (
        <section className="anatomy-section">
          <h2 className="anatomy-section-title">Adult proportions</h2>
          <ul className="v3-proportion-notes">
            <li>
              Heart ≈ <strong>⅓</strong> of chest width (fist-sized mediastinal
              organ)
            </li>
            <li>
              Mass mostly <strong>left of midline</strong>; apex toward
              mid-clavicular / V4
            </li>
            <li>
              Base near 2nd–3rd ICS; right atrial border at right sternal line
            </li>
          </ul>
        </section>
      )}

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
          <span>{isV3 ? 'Electrode & lead labels' : 'Anatomical labels'}</span>
        </label>
        <p className="anatomy-version-hint">
          Opacity drives the <strong>Src</strong> chamber model. Labels: Src
          chamber tags / V1 nodes / V2 pins / V3 electrodes.
        </p>
      </section>

      {isV3 ? (
        <section className="anatomy-section">
          <h2 className="anatomy-section-title">12-lead sites</h2>
          <p className="anatomy-version-hint">
            Ten surface electrodes → twelve derived leads. Click a site to
            highlight it on the torso.
          </p>
          <ul
            className="structure-list electrode-list"
            role="listbox"
            aria-label="ECG electrode sites"
          >
            {ELECTRODE_SITES.map((site) => (
              <ElectrodeListItem
                key={site.id}
                site={site}
                active={
                  selectedLead !== null && site.leads.includes(selectedLead)
                }
                locale={locale}
                onSelect={() => {
                  const lead = site.leads[0] ?? null
                  onSelectLead(
                    selectedLead && site.leads.includes(selectedLead)
                      ? null
                      : lead,
                  )
                }}
              />
            ))}
          </ul>
        </section>
      ) : (
        <section className="anatomy-section">
          <h2 className="anatomy-section-title">Structures</h2>
          <ul
            className="structure-list"
            role="listbox"
            aria-label="Heart structures"
          >
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
          {heartVersion !== 'anatomy' && (
            <p className="anatomy-version-hint">
              Switch to <strong>Src</strong> to highlight chambers in 3D. List
              selection still shows the clinical note below.
            </p>
          )}
        </section>
      )}

      <section className="anatomy-section anatomy-detail">
        <h2 className="anatomy-section-title">
          {isV3
            ? selectedElectrode
              ? selectedElectrode.id
              : 'Placement'
            : selected
              ? selected.label.en
              : 'Selection'}
        </h2>
        {isV3 ? (
          selectedElectrode ? (
            <>
              <p className="anatomy-detail-abbr">
                {selectedElectrode.group === 'precordial'
                  ? 'Precordial'
                  : 'Limb'}
                {selectedElectrode.leads.length > 0
                  ? ` · leads ${selectedElectrode.leads.join(', ')}`
                  : ' · ground'}
              </p>
              <p className="anatomy-detail-body">
                {locale === 'zh'
                  ? selectedElectrode.placeZh
                  : selectedElectrode.placeEn}
              </p>
            </>
          ) : (
            <p className="anatomy-detail-body anatomy-detail-body--muted">
              Adult torso schematic: heart ~⅓ chest width, apex toward V4.
              Click a V1–V6 or limb electrode on the model or in the list.
              Dashed guides mark mid-sternal, mid-clavicular, and 5th ICS.
            </p>
          )
        ) : selected ? (
          <>
            <p className="anatomy-detail-abbr">{selected.abbr}</p>
            <p className="anatomy-detail-body">{selected.description.en}</p>
          </>
        ) : (
          <p className="anatomy-detail-body anatomy-detail-body--muted">
            On <strong>Src</strong>, click a chamber (or the list). On V2–V3,
            click lead pins / electrodes. Cube faces snap to A/P/L/R/H/B.
          </p>
        )}
      </section>
    </aside>
  )
}

function ElectrodeListItem({
  site,
  active,
  locale,
  onSelect,
}: {
  site: ElectrodeSite
  active: boolean
  locale: 'en' | 'zh'
  onSelect: () => void
}) {
  const place = locale === 'zh' ? site.placeZh : site.placeEn
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={active}
        className={
          'structure-btn electrode-btn' +
          (active ? ' structure-btn--active' : '')
        }
        style={{ ['--swatch' as string]: site.color }}
        onClick={onSelect}
        title={place}
      >
        <span className="structure-swatch electrode-swatch" />
        <span className="structure-btn-text">
          <span className="structure-abbr">{site.id}</span>
          <span className="structure-name electrode-place">{place}</span>
        </span>
      </button>
    </li>
  )
}
