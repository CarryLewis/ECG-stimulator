import { useEffect, useRef, type CSSProperties } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
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
 * Clicking a face / legend button snaps OrbitControls so the camera sits on
 * that body-axis ray and looks at the orbit target.
 */

export interface CubeFaceDef {
  id: string
  label: string
  /** Outward face normal in body / world axes (= camera offset from target). */
  normal: Vector3
  titleKey: UiMessageKey
}

export const ORIENTATION_FACES: CubeFaceDef[] = [
  { id: 'A', label: 'A', titleKey: 'faceAnterior', normal: new Vector3(0, 0, 1) },
  { id: 'P', label: 'P', titleKey: 'facePosterior', normal: new Vector3(0, 0, -1) },
  { id: 'L', label: 'L', titleKey: 'faceLeft', normal: new Vector3(1, 0, 0) },
  { id: 'R', label: 'R', titleKey: 'faceRight', normal: new Vector3(-1, 0, 0) },
  { id: 'H', label: 'H', titleKey: 'faceHead', normal: new Vector3(0, 1, 0) },
  { id: 'B', label: 'B', titleKey: 'faceBottom', normal: new Vector3(0, -1, 0) },
]

const _offset = new Vector3()
const _pos = new Vector3()
const _target = new Vector3()

/** Bridge: main Canvas writes orbit state; CSS cube + click handlers share it. */
export const cameraBridge = {
  pendingFaceId: null as string | null,
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
    'getAzimuthalAngle' in value &&
    'getPolarAngle' in value &&
    'target' in value
  )
}

/**
 * Inside the heart Canvas — default useFrame priority only.
 * Never pass priority > 0 (that disables automatic heart rendering).
 *
 * Snaps must update OrbitControls (not only camera.quaternion), otherwise
 * damping / spherical state immediately undoes the view.
 */
export function CameraSync() {
  const { camera, controls } = useThree()
  const animRef = useRef({
    targetPos: new Vector3(),
    targetLook: new Vector3(),
    active: false,
  })

  useFrame(() => {
    const orbit = isOrbitControls(controls) ? controls : null

    const pending = cameraBridge.pendingFaceId
    if (pending) {
      const face = ORIENTATION_FACES.find((f) => f.id === pending)
      cameraBridge.pendingFaceId = null
      if (face) {
        _target.copy(orbit?.target ?? _target.set(0, 0, 0))
        _offset.copy(camera.position).sub(_target)
        const dist = Math.max(_offset.length(), 0.5)
        _pos.copy(face.normal).multiplyScalar(dist).add(_target)
        animRef.current.targetPos.copy(_pos)
        animRef.current.targetLook.copy(_target)
        animRef.current.active = true
        if (orbit) orbit.enabled = false
      }
    }

    const anim = animRef.current
    if (anim.active) {
      camera.position.lerp(anim.targetPos, 0.18)
      camera.up.set(0, 1, 0)
      camera.lookAt(anim.targetLook)
      if (camera.position.distanceTo(anim.targetPos) < 0.02) {
        camera.position.copy(anim.targetPos)
        camera.up.set(0, 1, 0)
        camera.lookAt(anim.targetLook)
        if (orbit) {
          orbit.target.copy(anim.targetLook)
          orbit.enabled = true
          orbit.update()
        }
        anim.active = false
      }
    }

    // Drive CSS cube from camera offset vs orbit target so the letter facing
    // the viewer is the body-axis side the camera looks from:
    //   +Y → H, −Y → B, +X → L, −X → R, +Z → A, −Z → P
    // Three.js spherical: theta=0 → +Z (A), phi=0 → +Y (H).
    // CSS 3D is Y-down → rotateX(-(phi−π/2)) rotateY(−theta).
    const el = cameraBridge.cubeEl
    if (el) {
      const look = orbit?.target ?? _target.set(0, 0, 0)
      _offset.copy(camera.position).sub(look)
      const radius = _offset.length()
      if (radius > 1e-6) {
        const theta = Math.atan2(_offset.x, _offset.z)
        const phi = Math.acos(Math.min(1, Math.max(-1, _offset.y / radius)))
        el.style.transform = `rotateX(${-((phi - Math.PI / 2))}rad) rotateY(${-theta}rad)`
      }
    }
  })

  return null
}

/**
 * CSS face placement at cube identity (anterior toward viewer):
 *   front A (+Z), back P, right-of-widget L (+X = patient left),
 *   left-of-widget R, top H (+Y), bottom B.
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
          title={t(f.titleKey)}
          onClick={() => cameraBridge.requestFace(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
