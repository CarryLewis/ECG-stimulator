import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useLanguage, type UiMessageKey } from '../i18n'

/**
 * DOM / CSS orientation cube — no second WebGL context.
 *
 * Body axes (same as the 3D heart / torso model):
 *   +x = patient left,  +y = superior (head),  +z = anterior
 *
 * Viewing rules — the letter facing the camera is the side you look *from*:
 *   from above  (superior → inferior) → H
 *   from below  (inferior → superior) → B
 *   from left   (patient left → right) → L
 *   from right  (patient right → left) → R
 *   from front  (anterior → posterior) → A
 *   from back   (posterior → anterior) → P
 *
 * Clicks snap OrbitControls via setAzimuthalAngle / setPolarAngle so the
 * spherical state (not only camera.position) matches the requested face.
 */

export interface CubeFaceDef {
  id: string
  label: string
  /** Outward face normal in body / world axes (= camera offset from target). */
  normal: Vector3
  titleKey: UiMessageKey
  /** OrbitControls spherical angles for this face (Three.js Y-up). */
  theta: number
  phi: number
}

export const ORIENTATION_FACES: CubeFaceDef[] = [
  {
    id: 'A',
    label: 'A',
    titleKey: 'faceAnterior',
    normal: new Vector3(0, 0, 1),
    theta: 0,
    phi: Math.PI / 2,
  },
  {
    id: 'P',
    label: 'P',
    titleKey: 'facePosterior',
    normal: new Vector3(0, 0, -1),
    theta: Math.PI,
    phi: Math.PI / 2,
  },
  {
    id: 'L',
    label: 'L',
    titleKey: 'faceLeft',
    normal: new Vector3(1, 0, 0),
    theta: Math.PI / 2,
    phi: Math.PI / 2,
  },
  {
    id: 'R',
    label: 'R',
    titleKey: 'faceRight',
    normal: new Vector3(-1, 0, 0),
    theta: -Math.PI / 2,
    phi: Math.PI / 2,
  },
  {
    id: 'H',
    label: 'H',
    titleKey: 'faceHead',
    normal: new Vector3(0, 1, 0),
    theta: 0,
    // OrbitControls.makeSafe() forbids exact 0; keep a tiny offset from the pole.
    phi: 0.12,
  },
  {
    id: 'B',
    label: 'B',
    titleKey: 'faceBottom',
    normal: new Vector3(0, -1, 0),
    theta: 0,
    phi: Math.PI - 0.12,
  },
]

const _offset = new Vector3()
const _target = new Vector3()

/** Bridge: main Canvas writes orbit state; CSS cube + click handlers share it. */
export const cameraBridge = {
  pendingFaceId: null as string | null,
  activeFaceId: null as string | null,
  requestFace(id: string) {
    this.pendingFaceId = id
  },
  /** Optional DOM node that receives CSS 3D rotation. */
  cubeEl: null as HTMLDivElement | null,
}

function isOrbitControls(value: unknown): value is OrbitControlsImpl {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as OrbitControlsImpl).getAzimuthalAngle === 'function' &&
    typeof (value as OrbitControlsImpl).getPolarAngle === 'function' &&
    typeof (value as OrbitControlsImpl).setAzimuthalAngle === 'function' &&
    typeof (value as OrbitControlsImpl).setPolarAngle === 'function' &&
    'target' in value
  )
}

function nearestFaceId(offset: Vector3): string | null {
  if (offset.lengthSq() < 1e-8) return null
  const dir = offset.clone().normalize()
  let best: string | null = null
  let bestDot = -Infinity
  for (const face of ORIENTATION_FACES) {
    const d = dir.dot(face.normal)
    if (d > bestDot) {
      bestDot = d
      best = face.id
    }
  }
  return bestDot > 0.55 ? best : null
}

/**
 * Inside the heart Canvas — default useFrame priority only.
 * Never pass priority > 0 (that disables automatic heart rendering).
 */
export function CameraSync() {
  const { camera, controls } = useThree()
  const listenersRef = useRef(false)

  useFrame(() => {
    const orbit = isOrbitControls(controls) ? controls : null

    // Expose for manual QA / DevTools: window.__ecgCube.requestFace('H')
    if (typeof window !== 'undefined' && !listenersRef.current) {
      ;(
        window as unknown as {
          __ecgCube?: {
            requestFace: (id: string) => void
            getActive: () => string | null
          }
        }
      ).__ecgCube = {
        requestFace: (id: string) => cameraBridge.requestFace(id),
        getActive: () => cameraBridge.activeFaceId,
      }
      listenersRef.current = true
    }

    const pending = cameraBridge.pendingFaceId
    if (pending && orbit) {
      const face = ORIENTATION_FACES.find((f) => f.id === pending)
      cameraBridge.pendingFaceId = null
      if (face) {
        // OrbitControls with enableDamping only applies a fraction of
        // setPolarAngle / setAzimuthalAngle per update(). Snap by writing
        // camera.position from the face spherical angles, then update() with
        // damping briefly disabled so spherical state rebuilds in one frame.
        const look = _target.copy(orbit.target)
        const dist = Math.max(camera.position.distanceTo(look), 0.5)
        const prevDamping = orbit.enableDamping
        orbit.enableDamping = false
        // Three.js spherical: (r, phi from +Y, theta around Y) — matches OrbitControls.
        _offset.setFromSphericalCoords(dist, face.phi, face.theta)
        camera.position.copy(look).add(_offset)
        camera.up.set(0, 1, 0)
        orbit.update()
        orbit.enableDamping = prevDamping
        cameraBridge.activeFaceId = face.id
      }
    }

    const el = cameraBridge.cubeEl
    const look = orbit?.target ?? _target.set(0, 0, 0)
    _offset.copy(camera.position).sub(look)
    const radius = _offset.length()
    if (radius > 1e-6) {
      cameraBridge.activeFaceId = nearestFaceId(_offset)

      // CSS 3D is Y-down. Map Three.js camera offset (Y-up) so the face whose
      // normal matches the view-from direction fills the front of the widget:
      //   +Y → H, −Y → B, +X → L, −X → R, +Z → A, −Z → P
      const theta = Math.atan2(_offset.x, _offset.z)
      const phi = Math.acos(MathUtils.clamp(_offset.y / radius, -1, 1))
      if (el) {
        el.style.transform = `rotateX(${-((phi - Math.PI / 2))}rad) rotateY(${-theta}rad)`
      }

      // Highlight the active face button for a visible rule cue.
      if (el) {
        const active = cameraBridge.activeFaceId
        for (const node of el.querySelectorAll<HTMLElement>('.orientation-cube-face')) {
          const id = node.dataset.faceId
          node.classList.toggle('orientation-cube-face--active', id === active)
        }
      }
    }
  })

  return null
}

/**
 * CSS face placement at cube identity (anterior toward viewer):
 *   front A (+Z), back P,
 *   right-of-widget L (+X = patient left when facing the patient),
 *   left-of-widget R (−X),
 *   top H (+Y), bottom B (−Y).
 *
 * CSS Y points down; rotateX(90deg) places a face on the visual top of the widget.
 */
const FACE_STYLE: Record<string, CSSProperties> = {
  A: { transform: `translateZ(52px)` },
  P: { transform: `rotateY(180deg) translateZ(52px)` },
  L: { transform: `rotateY(90deg) translateZ(52px)` },
  R: { transform: `rotateY(-90deg) translateZ(52px)` },
  H: { transform: `rotateX(90deg) translateZ(52px)` },
  B: { transform: `rotateX(-90deg) translateZ(52px)` },
}

const FACE_COLOR: Record<string, string> = {
  A: '#1a3355',
  P: '#1a3355',
  L: '#1a4035',
  R: '#1a4035',
  H: '#3d1a1a',
  B: '#3d1a1a',
}

/** CSS 3D orientation cube overlay (single WebGL context for the heart only). */
export default function OrientationCube() {
  const { t } = useLanguage()
  const cubeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    cameraBridge.cubeEl = cubeRef.current
    return () => {
      cameraBridge.cubeEl = null
    }
  }, [])

  return (
    <div
      className="orientation-cube-overlay"
      aria-label={t('orientationCube')}
      title={t('orientationCubeHint')}
    >
      <div className="orientation-cube-scene">
        <div className="orientation-cube" ref={cubeRef}>
          {ORIENTATION_FACES.map((f) => (
            <button
              key={f.id}
              type="button"
              className="orientation-cube-face"
              data-face-id={f.id}
              title={t(f.titleKey)}
              style={{
                ...FACE_STYLE[f.id],
                background: FACE_COLOR[f.id],
              }}
              onClick={() => cameraBridge.requestFace(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function OrientationLegend() {
  const { t } = useLanguage()
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setActiveId(cameraBridge.activeFaceId)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className="orientation-legend"
      role="group"
      aria-label={t('snapOrientation')}
      title={t('orientationCubeHint')}
    >
      {ORIENTATION_FACES.map((f) => (
        <button
          key={f.id}
          type="button"
          data-face-id={f.id}
          title={t(f.titleKey)}
          className={
            activeId === f.id ? 'orientation-legend-btn--active' : undefined
          }
          onClick={() => cameraBridge.requestFace(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
