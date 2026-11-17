import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type CSSProperties } from 'react'
import { Vector3 } from 'three'
import { HEART_STRUCTURES } from '../../anatomy/heartStructures'
import { SOURCE_ANCHORS } from '../../anatomy/sourceGeometry'
import type { HeartStructureId } from '../../anatomy/types'
import { useLanguage } from '../../i18n'

interface Props {
  selectedId: HeartStructureId | null
  onSelect: (id: HeartStructureId | null) => void
}

const PLACEMENT: Record<HeartStructureId, [number, number]> = {
  right_atrium: [-1, 0], left_atrium: [1, 0],
  septum: [-1, 0.5], right_ventricle: [-1, 1],
  left_ventricle: [1, 0.55], apex: [1, 1],
}

export default function SourceLabels({ selectedId, onSelect }: Props) {
  const { L } = useLanguage()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const lines = useRef<(SVGPathElement | null)[]>([])
  const points = useMemo(() => HEART_STRUCTURES.map(d => new Vector3(...SOURCE_ANCHORS[d.id])), [])
  const p = useMemo(() => new Vector3(), [])
  const projected = useMemo(() => points.map(() => new Vector3()), [points])
  const center = useMemo(() => new Vector3(), [])
  useFrame(({ camera, size }) => {
    projected.forEach((v, i) => v.copy(points[i]).project(camera))
    const ys = projected.map(v => (1 - v.y) * size.height / 2)
    const xs = projected.map(v => (1 + v.x) * size.width / 2)
    center.set(0, 0.1, 0).project(camera)
    const cx = (1 + center.x) * size.width / 2
    const minY = size.width <= 360 ? 200 : size.width <= 900 ? 156 : 94
    const maxY = size.height - 156
    const span = Math.min(Math.max(160, Math.max(...ys) - Math.min(...ys)), maxY - minY)
    const ty = Math.max(minY, Math.min(maxY - span, (Math.max(...ys) + Math.min(...ys) - span) / 2))
    const radius = Math.max(42, (Math.max(...xs) - Math.min(...xs)) / 2)
    HEART_STRUCTURES.forEach((def, i) => {
      const button = buttons.current[i]
      const line = lines.current[i]
      if (!button || !line) return
      p.copy(projected[i])
      const ax = (1 + p.x) * size.width / 2
      const ay = (1 - p.y) * size.height / 2
      const [side, row] = PLACEMENT[def.id]
      const minX = size.width > 900 ? (size.width >= 1000 ? 320 : 230) : 12
      const width = button.offsetWidth
      const x = Math.max(minX, Math.min(size.width - width - 12, cx + side * (radius + 16) - (side < 0 ? width : 0)))
      const y = ty + span * row
      button.style.transform = `translate3d(${x}px,${y}px,0)`
      const ex = x + (side < 0 ? width : 0)
      line.setAttribute('d', `M${ax},${ay} L${ex + (side < 0 ? 12 : -12)},${y + 14} L${ex},${y + 14}`)
      const visible = p.z < 1 && ax >= 0 && ax <= size.width && ay >= 0 && ay <= size.height
      button.style.visibility = visible ? 'visible' : 'hidden'
      line.style.visibility = visible ? 'visible' : 'hidden'
    })
  })
  return (
    <Html fullscreen calculatePosition={(_, __, size) => [size.width / 2, size.height / 2]}
      zIndexRange={[2, 0]} style={{ pointerEvents: 'none' }}>
      <div className="source-label-layer">
        <svg className="source-label-lines" aria-hidden="true">
          {HEART_STRUCTURES.map((def, i) => <path key={def.id}
            ref={el => { lines.current[i] = el }}
            className={selectedId === def.id ? 'source-leader--selected' : undefined} />)}
        </svg>
        {HEART_STRUCTURES.map((def, i) => (
          <button key={def.id} ref={el => { buttons.current[i] = el }}
            type="button" data-structure={def.id}
            className="source-label" aria-pressed={selectedId === def.id}
            aria-label={`${def.abbr} ${L(def.label)}`} title={L(def.label)}
            style={{ '--structure-color': def.color } as CSSProperties}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation()
              onSelect(selectedId === def.id ? null : def.id)
            }}>
            <span className="source-label-code">{def.abbr}</span>
            <span className="source-label-text">{L(def.label)}</span>
          </button>
        ))}
      </div>
    </Html>
  )
}
