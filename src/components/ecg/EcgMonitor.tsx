/**
 * Hospital-style ECG recording monitor.
 *
 * Subscribes to the shared simulation clock via the recorder —
 * does not invent independent waveform animations.
 */

import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import type { LeadName } from '../../ecg/types'
import {
  lastVentricularPeak,
  previousVentricularPeak,
} from '../../recording/ringBuffer'
import {
  DEFAULT_CALIBRATION,
  DEFAULT_STRIP_SECONDS,
  gridForLayout,
  type DisplayMode,
  type LeadLayoutMode,
  type SweepSpeedMmPerS,
} from '../../recording/types'
import { useEcgRecorder } from '../../recording/useEcgRecorder'
import type { TransportClock } from '../../recording/useTransportClock'
import { cycleLength_s } from '../../sim/sinusTiming'
import EcgRecordingControls from './EcgRecordingControls'
import EcgStripCanvas from './EcgStripCanvas'

export interface EcgMonitorProps {
  clock: TransportClock
  rateBpm: number
  /** Optional external lead selection sync with anatomy pins. */
  selectedLead?: LeadName | null
  onSelectedLeadChange?: (lead: LeadName) => void
}

export default function EcgMonitor({
  clock,
  rateBpm,
  selectedLead: externalLead,
  onSelectedLeadChange,
}: EcgMonitorProps) {
  const [sweep, setSweep] = useState<SweepSpeedMmPerS>(25)
  const [zoom, setZoom] = useState(1)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('monitor')
  const [layoutMode, setLayoutMode] = useState<LeadLayoutMode>('lead_ii')
  const [internalLead, setInternalLead] = useState<LeadName>('II')

  const selectedLead = externalLead ?? internalLead

  const setLead = useCallback(
    (lead: LeadName) => {
      setInternalLead(lead)
      onSelectedLeadChange?.(lead)
    },
    [onSelectedLeadChange],
  )

  const armed = !clock.frozen
  const recorder = useEcgRecorder(clock.elapsed, rateBpm, armed)

  const calibration = useMemo(
    () => ({
      ...DEFAULT_CALIBRATION,
      sweep_mm_s: sweep,
    }),
    [sweep],
  )

  const grid = gridForLayout(layoutMode, selectedLead)

  const handleReplayLastBeat = useCallback(() => {
    const buf = recorder.buffer
    const last = lastVentricularPeak(buf)
    const prev = previousVentricularPeak(buf)
    const rr = cycleLength_s(rateBpm)
    const start =
      prev != null
        ? Math.max(0, prev - 0.05)
        : last != null
          ? Math.max(0, last - rr * 0.35)
          : Math.max(0, clock.elapsed - rr)
    clock.seek(start)
    clock.setFrozen(false)
    clock.resume()
    // Freeze again after roughly one cycle via a delayed pause.
    window.setTimeout(() => {
      clock.pause()
    }, (rr / Math.max(0.05, clock.timeScale)) * 1000)
  }, [recorder.buffer, rateBpm, clock])

  const peaks = recorder.buffer.ventricularPeaks_s
  let measuredHr = rateBpm
  if (peaks.length >= 2) {
    const a = peaks[peaks.length - 2]!
    const b = peaks[peaks.length - 1]!
    const dt = b - a
    if (dt > 0.2 && dt <= 2.5) measuredHr = Math.round(60 / dt)
  }
  // Touch frame so HR updates as samples arrive (peaks mutate in-place).
  void recorder.frame

  const cellHeight =
    layoutMode === 'twelve' ? 78 : layoutMode === 'six' ? 96 : 140

  return (
    <section
      className={`ecg-monitor ecg-monitor--${displayMode}`}
      aria-label="ECG recording monitor"
    >
      <header className="ecg-monitor-header">
        <div className="ecg-monitor-title-block">
          <p className="ecg-monitor-eyebrow">Bedside recording</p>
          <h2 className="ecg-monitor-title">ECG Monitor</h2>
        </div>
        <div className="ecg-monitor-hud" aria-live="polite">
          <span className="ecg-hud-pill">
            {clock.frozen ? 'FROZEN' : clock.paused ? 'PAUSED' : 'REC'}
          </span>
          <span className="ecg-hud-pill ecg-hud-pill--hr">{measuredHr} bpm</span>
          <span className="ecg-hud-pill">
            {sweep} mm/s · {calibration.gain_mm_mV} mm/mV
          </span>
          <span className="ecg-hud-pill">{calibration.fs_Hz} Hz</span>
          <span className="ecg-hud-pill">t = {clock.elapsed.toFixed(2)} s</span>
        </div>
      </header>

      <EcgRecordingControls
        paused={clock.paused}
        frozen={clock.frozen}
        sweep={sweep}
        zoom={zoom}
        displayMode={displayMode}
        layoutMode={layoutMode}
        selectedLead={selectedLead}
        onPause={clock.pause}
        onResume={clock.resume}
        onStep={() => clock.stepForward(1 / calibration.fs_Hz)}
        onFreezeToggle={clock.toggleFreeze}
        onSweepChange={setSweep}
        onZoomChange={setZoom}
        onDisplayModeChange={setDisplayMode}
        onLayoutModeChange={setLayoutMode}
        onLeadChange={setLead}
        onReplayLastBeat={handleReplayLastBeat}
      />

      <div className="ecg-monitor-screen">
        <div
          className={`ecg-lead-grid ecg-lead-grid--${layoutMode}`}
          style={
            {
              '--ecg-cols': grid[0]?.length ?? 1,
            } as CSSProperties
          }
        >
          {grid.flatMap((row) =>
            row.map((lead) => (
              <div
                key={lead}
                role="button"
                tabIndex={0}
                className={`ecg-lead-cell${
                  selectedLead === lead ? ' ecg-lead-cell--selected' : ''
                }`}
                onClick={() => setLead(lead)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setLead(lead)
                  }
                }}
                aria-pressed={selectedLead === lead}
              >
                <EcgStripCanvas
                  buffer={recorder.buffer}
                  lead={lead}
                  frame={recorder.frame}
                  calibration={calibration}
                  mode={displayMode}
                  windowSeconds={
                    layoutMode === 'twelve'
                      ? DEFAULT_STRIP_SECONDS * 0.7
                      : DEFAULT_STRIP_SECONDS
                  }
                  zoom={zoom}
                  height={cellHeight}
                  showCursor={!clock.frozen}
                />
              </div>
            )),
          )}
        </div>

        {layoutMode !== 'lead_ii' && layoutMode !== 'single' && (
          <div className="ecg-rhythm-strip">
            <p className="ecg-rhythm-label">Rhythm strip · Lead II</p>
            <EcgStripCanvas
              buffer={recorder.buffer}
              lead="II"
              frame={recorder.frame}
              calibration={calibration}
              mode={displayMode}
              windowSeconds={DEFAULT_STRIP_SECONDS * 1.25}
              zoom={zoom}
              height={110}
              showCursor={!clock.frozen}
            />
          </div>
        )}
      </div>

      <footer className="ecg-monitor-footer">
        <span>
          Signal acquisition → real-time plot → continuous scroll — synced to
          SA → AV → ventricle activation
        </span>
      </footer>
    </section>
  )
}
