/**
 * ECG recording transport + display controls.
 */

import type { LeadName } from '../../ecg/types'
import { LEAD_ORDER } from '../../ecg/leads'
import {
  SWEEP_OPTIONS,
  type DisplayMode,
  type LeadLayoutMode,
  type SweepSpeedMmPerS,
} from '../../recording/types'

export interface EcgRecordingControlsProps {
  paused: boolean
  frozen: boolean
  sweep: SweepSpeedMmPerS
  zoom: number
  displayMode: DisplayMode
  layoutMode: LeadLayoutMode
  selectedLead: LeadName
  onPause: () => void
  onResume: () => void
  onStep: () => void
  onFreezeToggle: () => void
  onSweepChange: (s: SweepSpeedMmPerS) => void
  onZoomChange: (z: number) => void
  onDisplayModeChange: (m: DisplayMode) => void
  onLayoutModeChange: (m: LeadLayoutMode) => void
  onLeadChange: (l: LeadName) => void
  onReplayLastBeat: () => void
}

export default function EcgRecordingControls({
  paused,
  frozen,
  sweep,
  zoom,
  displayMode,
  layoutMode,
  selectedLead,
  onPause,
  onResume,
  onStep,
  onFreezeToggle,
  onSweepChange,
  onZoomChange,
  onDisplayModeChange,
  onLayoutModeChange,
  onLeadChange,
  onReplayLastBeat,
}: EcgRecordingControlsProps) {
  return (
    <div className="ecg-controls" role="toolbar" aria-label="ECG recording controls">
      <div className="ecg-controls-group">
        <span className="ecg-controls-label">Transport</span>
        <div className="ecg-controls-row">
          {paused || frozen ? (
            <button type="button" className="ecg-btn ecg-btn--primary" onClick={onResume}>
              Resume
            </button>
          ) : (
            <button type="button" className="ecg-btn" onClick={onPause}>
              Pause
            </button>
          )}
          <button type="button" className="ecg-btn" onClick={onStep} title="Step one sample">
            Step
          </button>
          <button
            type="button"
            className={`ecg-btn${frozen ? ' ecg-btn--active' : ''}`}
            onClick={onFreezeToggle}
          >
            {frozen ? 'Unfreeze' : 'Freeze'}
          </button>
          <button type="button" className="ecg-btn" onClick={onReplayLastBeat}>
            Replay beat
          </button>
        </div>
      </div>

      <div className="ecg-controls-group">
        <span className="ecg-controls-label">Sweep speed</span>
        <div className="ecg-controls-row ecg-seg">
          {SWEEP_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`ecg-btn${sweep === s ? ' ecg-btn--active' : ''}`}
              onClick={() => onSweepChange(s)}
            >
              {s} mm/s
            </button>
          ))}
        </div>
      </div>

      <div className="ecg-controls-group">
        <span className="ecg-controls-label">Zoom {zoom.toFixed(1)}×</span>
        <input
          type="range"
          min={0.75}
          max={2.5}
          step={0.05}
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          aria-label="ECG zoom"
        />
      </div>

      <div className="ecg-controls-group">
        <span className="ecg-controls-label">Display</span>
        <div className="ecg-controls-row ecg-seg">
          <button
            type="button"
            className={`ecg-btn${displayMode === 'monitor' ? ' ecg-btn--active' : ''}`}
            aria-pressed={displayMode === 'monitor'}
            onClick={() => onDisplayModeChange('monitor')}
          >
            Monitor
          </button>
          <button
            type="button"
            className={`ecg-btn${displayMode === 'paper' ? ' ecg-btn--active' : ''}`}
            aria-pressed={displayMode === 'paper'}
            onClick={() => onDisplayModeChange('paper')}
          >
            Paper
          </button>
        </div>
      </div>

      <div className="ecg-controls-group">
        <span className="ecg-controls-label">Leads</span>
        <div className="ecg-controls-row ecg-seg">
          {(
            [
              ['lead_ii', 'Lead II'],
              ['single', 'Single'],
              ['six', 'Six'],
              ['twelve', '12-lead'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`ecg-btn${layoutMode === id ? ' ecg-btn--active' : ''}`}
              onClick={() => onLayoutModeChange(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {(layoutMode === 'single' || layoutMode === 'lead_ii') && (
          <label className="ecg-lead-select">
            <span>Lead</span>
            <select
              value={layoutMode === 'lead_ii' ? 'II' : selectedLead}
              disabled={layoutMode === 'lead_ii'}
              onChange={(e) => onLeadChange(e.target.value as LeadName)}
            >
              {LEAD_ORDER.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  )
}
