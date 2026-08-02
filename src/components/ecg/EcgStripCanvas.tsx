/**
 * Continuous scrolling ECG strip (Canvas).
 *
 * Draws persistent ring-buffer history: oldest left → newest right.
 * Grid paper scrolls with the sweep. Never regenerates a static full-strip path.
 */

import { useEffect, useRef } from 'react'
import type { LeadName } from '../../ecg/types'
import {
  readRecent,
  type EcgRingBuffer,
} from '../../recording/ringBuffer'
import {
  pxPerMv,
  pxPerSecond,
  type DisplayMode,
  type RecordingCalibration,
  DEFAULT_STRIP_SECONDS,
} from '../../recording/types'

export interface EcgStripCanvasProps {
  buffer: EcgRingBuffer
  lead: LeadName
  /** Trigger from recorder frame counter. */
  frame: number
  calibration: RecordingCalibration
  mode: DisplayMode
  /** Visible window seconds (before zoom). */
  windowSeconds?: number
  /** Display zoom (1 = calibrated, >1 magnifies time & optional amplitude). */
  zoom?: number
  height?: number
  /** Show sweep cursor at the right edge (live recording tip). */
  showCursor?: boolean
  className?: string
}

function theme(mode: DisplayMode) {
  if (mode === 'paper') {
    return {
      bg: '#f7f3ef',
      fine: 'rgba(220, 120, 130, 0.35)',
      bold: 'rgba(200, 80, 95, 0.55)',
      baseline: 'rgba(120, 60, 70, 0.25)',
      trace: '#1a1a1a',
      cursor: '#0d9488',
      label: '#111827',
      meta: '#6b7280',
    }
  }
  return {
    bg: '#050a0e',
    fine: 'rgba(45, 120, 110, 0.22)',
    bold: 'rgba(55, 160, 145, 0.35)',
    baseline: 'rgba(80, 180, 160, 0.2)',
    trace: '#5eead4',
    cursor: 'rgba(250, 220, 120, 0.9)',
    label: '#e8eef5',
    meta: '#8fa3b8',
  }
}

export default function EcgStripCanvas({
  buffer,
  lead,
  frame,
  calibration,
  mode,
  windowSeconds = DEFAULT_STRIP_SECONDS,
  zoom = 1,
  height = 120,
  showCursor = true,
  className,
}: EcgStripCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scratchRef = useRef<Float32Array | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const z = Math.max(0.5, Math.min(3, zoom))
    const visible_s = windowSeconds / z
    const pps = pxPerSecond(calibration) * z
    let ppmv = pxPerMv(calibration) * Math.min(z, 1.5)
    const width = visible_s * pps
    const mm = calibration.px_per_mm * z

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cssW = Math.max(1, Math.round(width * dpr))
    const cssH = Math.max(1, Math.round(height * dpr))
    if (canvas.width !== cssW) canvas.width = cssW
    if (canvas.height !== cssH) canvas.height = cssH
    canvas.style.width = '100%'
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const c = theme(mode)
    ctx.fillStyle = c.bg
    ctx.fillRect(0, 0, width, height)

    // Scroll grid with paper: offset by fractional mm of "now".
    const scrollPx = (buffer.tEnd * pps) % (mm * 5)
    const gridShift = -scrollPx

    ctx.strokeStyle = c.fine
    ctx.lineWidth = 0.6
    for (let x = gridShift; x <= width + mm; x += mm) {
      ctx.beginPath()
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, height)
      ctx.stroke()
    }
    for (let y = 0; y <= height; y += mm) {
      ctx.beginPath()
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(width, y + 0.5)
      ctx.stroke()
    }

    ctx.strokeStyle = c.bold
    ctx.lineWidth = 1
    for (let x = gridShift; x <= width + mm * 5; x += mm * 5) {
      ctx.beginPath()
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, height)
      ctx.stroke()
    }
    for (let y = 0; y <= height; y += mm * 5) {
      ctx.beginPath()
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(width, y + 0.5)
      ctx.stroke()
    }

    // Slightly above mid so upright R has more headroom than deep S.
    const baseline = height * 0.58

    const need = Math.ceil(visible_s * buffer.fs) + 2
    if (!scratchRef.current || scratchRef.current.length < need) {
      scratchRef.current = new Float32Array(need)
    }
    const scratch = scratchRef.current
    const count = readRecent(buffer, lead, need, scratch)

    // Shared gain for all leads (do NOT normalize per-lead — that destroys
    // R-wave progression / aVR inversion teaching). Fit once to cell height
    // for a fixed physiological range (~±1.7 mV including cal pulse).
    const maxPhys_mV = 1.7
    const room = Math.min(baseline - 4, height - baseline - 4)
    if (room > 8) {
      ppmv = Math.min(ppmv, room / maxPhys_mV)
    }

    ctx.strokeStyle = c.baseline
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, baseline + 0.5)
    ctx.lineTo(width, baseline + 0.5)
    ctx.stroke()

    // Calibration pulse (1 mV × 200 ms) at left — hospital style.
    const calW = 0.2 * pps
    const calH = 1.0 * ppmv
    ctx.strokeStyle = c.trace
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(4, baseline)
    ctx.lineTo(4, baseline - calH)
    ctx.lineTo(4 + calW, baseline - calH)
    ctx.lineTo(4 + calW, baseline)
    ctx.stroke()

    if (count > 1) {
      ctx.beginPath()
      ctx.strokeStyle = c.trace
      // Slightly heavier stroke so narrow QRS is visible at 25 mm/s.
      ctx.lineWidth = mode === 'paper' ? 1.7 : 1.85
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      // Map samples so the newest sits at the right edge (recording tip).
      for (let i = 0; i < count; i++) {
        const age_s = (count - 1 - i) / buffer.fs
        const x = width - age_s * pps
        const y = Math.max(1, Math.min(height - 1, baseline - scratch[i]! * ppmv))
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    if (showCursor) {
      ctx.strokeStyle = c.cursor
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(width - 1.5, 0)
      ctx.lineTo(width - 1.5, height)
      ctx.stroke()
    }

    ctx.fillStyle = c.label
    ctx.font = '700 12px "IBM Plex Sans", system-ui, sans-serif'
    ctx.fillText(lead, 10, 16)

    ctx.fillStyle = c.meta
    ctx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace'
    ctx.fillText(
      `${calibration.sweep_mm_s} mm/s · ${calibration.gain_mm_mV} mm/mV`,
      10,
      height - 8,
    )
  }, [
    buffer,
    lead,
    frame,
    calibration,
    mode,
    windowSeconds,
    zoom,
    height,
    showCursor,
  ])

  return (
    <canvas
      ref={canvasRef}
      className={className ?? 'ecg-strip-canvas'}
      role="img"
      aria-label={`Lead ${lead} continuous ECG recording`}
    />
  )
}
