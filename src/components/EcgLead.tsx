import { useEffect, useRef } from 'react'
import type { LeadName } from '../ecg/types'

/** CSS pixels per millimetre — keeps 25 mm/s · 10 mm/mV calibration. */
const MM = 4.8
const PX_PER_S = 25 * MM
const PX_PER_MV = 10 * MM

interface EcgLeadLiveProps {
  lead: LeadName
  /** Ring buffer: index i maps to a fixed x column (cascade sweep, not scroll). */
  samples: Float32Array
  /** Next write index in the ring (0 … samples.length). */
  writeIndex: number
  /** How many samples have ever been written (caps first sweep). */
  written: number
  duration: number
  height?: number
  /** Increments each simulation frame to trigger redraw. */
  tick: number
  /** Show a brighter sweep beam (used on the lead-II strip). */
  showBeam?: boolean
}

/**
 * Bedside-monitor cascade renderer.
 *
 * The grid is fixed. A bright beam sweeps left → right, writing the waveform
 * in place and erasing a thin gap just ahead of the beam — the classic
 * "phosphor" look, not a scrolling paper strip.
 */
export default function EcgLeadLive({
  lead,
  samples,
  writeIndex,
  written,
  duration,
  height = 130,
  tick,
  showBeam = true,
}: EcgLeadLiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const capacity = samples.length
    if (capacity < 2) return

    const width = duration * PX_PER_S
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cssW = Math.round(width * dpr)
    const cssH = Math.round(height * dpr)
    if (canvas.width !== cssW) canvas.width = cssW
    if (canvas.height !== cssH) canvas.height = cssH
    canvas.style.width = '100%'
    canvas.style.height = 'auto'

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // CRT / LCD monitor face
    ctx.fillStyle = '#020805'
    ctx.fillRect(0, 0, width, height)

    drawMonitorGrid(ctx, width, height)

    const baseline = height / 2
    const xOf = (i: number) => (i / (capacity - 1)) * width
    const yOf = (v: number) => baseline - v * PX_PER_MV

    // Erase bar just ahead of the write head (~100 ms of blank).
    const gap = Math.max(4, Math.round(capacity * 0.04))
    const ready = Math.min(written, capacity)

    ctx.save()
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.shadowColor = 'rgba(52, 255, 140, 0.55)'
    ctx.shadowBlur = 4
    ctx.strokeStyle = '#3dff8a'
    ctx.lineWidth = 1.55

    if (ready > 1) {
      if (ready < capacity) {
        // First sweep: draw 0 … writeIndex-1 continuously.
        strokeSegment(ctx, samples, 0, writeIndex, xOf, yOf)
      } else {
        // Full buffer: draw everything except the erase gap after the head.
        const gapEnd = (writeIndex + gap) % capacity
        if (writeIndex + gap < capacity) {
          strokeSegment(ctx, samples, gapEnd, capacity, xOf, yOf)
          strokeSegment(ctx, samples, 0, writeIndex, xOf, yOf)
        } else {
          // Gap wraps past the right edge.
          strokeSegment(ctx, samples, gapEnd, writeIndex, xOf, yOf)
        }
      }
    }
    ctx.restore()

    // Sweep beam at the write head
    if (showBeam && ready > 0) {
      const beamX = xOf(Math.max(0, writeIndex - 1))
      const beamY = yOf(samples[Math.max(0, writeIndex - 1)] ?? 0)

      const grad = ctx.createLinearGradient(beamX, 0, beamX, height)
      grad.addColorStop(0, 'rgba(180, 255, 210, 0)')
      grad.addColorStop(0.5, 'rgba(180, 255, 210, 0.55)')
      grad.addColorStop(1, 'rgba(180, 255, 210, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(beamX - 1.2, 0, 2.4, height)

      ctx.beginPath()
      ctx.fillStyle = '#e8ffe8'
      ctx.shadowColor = '#3dff8a'
      ctx.shadowBlur = 10
      ctx.arc(beamX, beamY, 2.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Lead label (monitor HUD style)
    ctx.fillStyle = 'rgba(61, 255, 138, 0.85)'
    ctx.font = '700 12px "IBM Plex Mono", "SF Mono", ui-monospace, monospace'
    ctx.fillText(lead, 8, 15)
  }, [lead, samples, writeIndex, written, duration, height, tick, showBeam])

  return (
    <canvas
      ref={canvasRef}
      className="ecg-lead ecg-lead--live"
      role="img"
      aria-label={`Lead ${lead} monitor sweep`}
    />
  )
}

function drawMonitorGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  // Fine 1 mm
  ctx.strokeStyle = 'rgba(20, 90, 45, 0.45)'
  ctx.lineWidth = 0.5
  for (let x = 0; x <= width; x += MM) {
    ctx.beginPath()
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += MM) {
    ctx.beginPath()
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(width, y + 0.5)
    ctx.stroke()
  }
  // Bold 5 mm
  ctx.strokeStyle = 'rgba(35, 140, 70, 0.55)'
  ctx.lineWidth = 0.9
  for (let x = 0; x <= width; x += MM * 5) {
    ctx.beginPath()
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += MM * 5) {
    ctx.beginPath()
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(width, y + 0.5)
    ctx.stroke()
  }
  // Baseline
  ctx.strokeStyle = 'rgba(61, 255, 138, 0.18)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, height / 2 + 0.5)
  ctx.lineTo(width, height / 2 + 0.5)
  ctx.stroke()
}

/** Stroke a contiguous [from, to) range of ring-buffer samples. */
function strokeSegment(
  ctx: CanvasRenderingContext2D,
  samples: Float32Array,
  from: number,
  to: number,
  xOf: (i: number) => number,
  yOf: (v: number) => number,
) {
  if (to - from < 2) return
  ctx.beginPath()
  for (let i = from; i < to; i++) {
    const x = xOf(i)
    const y = yOf(samples[i]!)
    if (i === from) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
}
