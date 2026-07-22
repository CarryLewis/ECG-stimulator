import { useEffect, useRef } from 'react'
import type { LeadName } from '../ecg/types'

/** 1 mm in CSS pixels — drives standard 25 mm/s and 10 mm/mV calibration. */
const MM = 4.8
const PX_PER_S = 25 * MM
const PX_PER_MV = 10 * MM
const FS = 250

interface EcgLeadLiveProps {
  lead: LeadName
  samples: Float32Array
  filled: number
  duration: number
  height?: number
  /** Increments each simulation frame to trigger redraw. */
  tick: number
}

/**
 * Canvas renderer for one lead. Samples are produced by the parent from the
 * shared dipole engine so every lead stays phase-locked.
 */
export default function EcgLeadLive({
  lead,
  samples,
  filled,
  duration,
  height = 130,
  tick,
}: EcgLeadLiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

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

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Fine grid (1 mm)
    ctx.strokeStyle = '#f4cfd6'
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
    // Bold grid (5 mm)
    ctx.strokeStyle = '#e79aa6'
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

    const baseline = height / 2
    const count = Math.min(filled, samples.length)
    if (count > 1) {
      ctx.beginPath()
      ctx.strokeStyle = '#111827'
      ctx.lineWidth = 1.4
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      for (let i = 0; i < count; i++) {
        const x = width - ((count - 1 - i) / FS) * PX_PER_S
        const y = baseline - samples[i]! * PX_PER_MV
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    // Sweep cursor at "now" (right edge) — same clock as conduction glow.
    ctx.strokeStyle = '#059669'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(width - 1, 0)
    ctx.lineTo(width - 1, height)
    ctx.stroke()

    ctx.fillStyle = '#111827'
    ctx.font = '700 13px system-ui, sans-serif'
    ctx.fillText(lead, 6, 16)
  }, [lead, samples, filled, duration, height, tick])

  return (
    <canvas
      ref={canvasRef}
      className="ecg-lead ecg-lead--live"
      role="img"
      aria-label={`Lead ${lead} live ECG trace`}
    />
  )
}
