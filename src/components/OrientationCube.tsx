import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Matrix4, Quaternion, Vector3 } from 'three'

/**
 * Orientation cube = the **patient’s body** (not a free camera gizmo).
 *
 * Body axes (same as ECG / anatomy modules):
 *   +X = patient’s left   −X = patient’s right
 *   +Y = head (superior)  −Y = feet / bottom
 *   +Z = anterior (front) −Z = posterior (back)
 *
 * Viewing rules (what face points at you):
 *   Looking at the chest (camera on +Z)     → A (front)
 *   Looking down from above (camera on +Y)  → H (head)
 *   Looking up from below (camera on −Y)    → B (bottom)
 *   Looking from patient’s left (+X)        → L
 *   Looking from patient’s right (−X)       → R
 *   Looking at the back (camera on −Z)      → P
 */

export interface CubeFaceDef {
  id: string
  label: string
  /** Outward normal of that body face in world / body coordinates. */
  normal: Vector3
  title: string
  titleZh: string
}

export const ORIENTATION_FACES: CubeFaceDef[] = [
  {
    id: 'A',
    label: 'A',
    title: 'Anterior (front)',
    titleZh: '前面',
    normal: new Vector3(0, 0, 1),
  },
  {
    id: 'P',
    label: 'P',
    title: 'Posterior (back)',
    titleZh: '后面',
    normal: new Vector3(0, 0, -1),
  },
  {
    id: 'L',
    label: 'L',
    title: 'Left (patient)',
    titleZh: '左面',
    normal: new Vector3(1, 0, 0),
  },
  {
    id: 'R',
    label: 'R',
    title: 'Right (patient)',
    titleZh: '右面',
    normal: new Vector3(-1, 0, 0),
  },
  {
    id: 'H',
    label: 'H',
    title: 'Head (superior)',
    titleZh: '头侧',
    normal: new Vector3(0, 1, 0),
  },
  {
    id: 'B',
    label: 'B',
    title: 'Bottom (inferior)',
    titleZh: '足侧',
    normal: new Vector3(0, -1, 0),
  },
]

const _q = new Quaternion()
const _v = new Vector3()
const _m = new Matrix4()
const _inv = new Quaternion()
const _yFlip = new Matrix4().makeScale(1, -1, 1)
const _viewDir = new Vector3()

/** Bridge: main Canvas ↔ CSS cube / legend. */
export const cameraBridge = {
  quat: new Quaternion(),
  position: new Vector3(),
  pendingFaceId: null as string | null,
  activeFaceId: 'A' as string,
  requestFace(id: string) {
    this.pendingFaceId = id
  },
  cubeEl: null as HTMLDivElement | null,
  _faceListeners: new Set<(id: string) => void>(),
  subscribeActiveFace(fn: (id: string) => void) {
    this._faceListeners.add(fn)
    return () => {
      this._faceListeners.delete(fn)
    }
  },
  notifyActiveFace(id: string) {
    this.activeFaceId = id
    for (const fn of this._faceListeners) fn(id)
  },
}

/** Which body face is currently facing the camera? */
export function faceTowardCamera(camPos: Vector3): string {
  // Direction from origin toward camera = which body side we look at.
  _viewDir.copy(camPos).normalize()
  let best = ORIENTATION_FACES[0]
  let bestDot = -Infinity
  for (const f of ORIENTATION_FACES) {
    const d = _viewDir.dot(f.normal)
    if (d > bestDot) {
      bestDot = d
      best = f
    }
  }
  return best.id
}

function applyCubeCssTransform(el: HTMLDivElement, camQuat: Quaternion) {
  // Rotate the patient-body cube by the inverse camera rotation so the face
  // toward the viewer matches the body side you are looking at.
  // CSS 3D is Y-down; Three.js is Y-up → sandwich with scale(1,-1,1).
  _inv.copy(camQuat).invert()
  _m.makeRotationFromQuaternion(_inv)
  _m.premultiply(_yFlip).multiply(_yFlip)
  const e = _m.elements
  el.style.transform = `matrix3d(${[
    e[0], e[1], e[2], e[3],
    e[4], e[5], e[6], e[7],
    e[8], e[9], e[10], e[11],
    e[12], e[13], e[14], e[15],
  ].join(',')})`
}

/**
 * Inside the heart Canvas — default useFrame priority only.
 * Never pass priority > 0 (that disables automatic heart rendering).
 */
export function CameraSync() {
  const { camera } = useThree()
  const animRef = useRef({
    targetQuat: new Quaternion(),
    targetPos: new Vector3(),
    active: false,
  })

  useFrame(() => {
    cameraBridge.quat.copy(camera.quaternion)
    cameraBridge.position.copy(camera.position)

    const pending = cameraBridge.pendingFaceId
    if (pending) {
      const face = ORIENTATION_FACES.find((f) => f.id === pending)
      cameraBridge.pendingFaceId = null
      if (face) {
        const dist = Math.max(2.4, camera.position.length())
        // Place camera on the outward normal of that body face.
        const pos = face.normal.clone().multiplyScalar(dist)
        const up =
          Math.abs(face.normal.y) > 0.9
            ? // From head: keep anterior "down" on screen; from feet: anterior "up"
              new Vector3(0, 0, face.normal.y > 0 ? -1 : 1)
            : new Vector3(0, 1, 0)
        _m.lookAt(pos, new Vector3(0, 0, 0), up)
        animRef.current = {
          targetQuat: new Quaternion().setFromRotationMatrix(_m),
          targetPos: pos,
          active: true,
        }
      }
    }

    const anim = animRef.current
    if (anim.active) {
      camera.getWorldQuaternion(_q)
      _q.slerp(anim.targetQuat, 0.14)
      const dist = camera.position.length()
      _v.set(0, 0, dist).applyQuaternion(_q)
      camera.position.copy(_v)
      camera.quaternion.copy(_q)
      if (_q.angleTo(anim.targetQuat) < 0.003) {
        camera.position.copy(anim.targetPos)
        camera.lookAt(0, 0, 0)
        anim.active = false
      }
    }

    const el = cameraBridge.cubeEl
    if (el) applyCubeCssTransform(el, camera.quaternion)

    const facing = faceTowardCamera(camera.position)
    if (facing !== cameraBridge.activeFaceId) {
      cameraBridge.notifyActiveFace(facing)
    }
  })

  return null
}

/**
 * CSS face placement in a Y-up mental model (parent applies scaleY(-1)
 * so screen "up" matches head). Normals match body axes above.
 */
const FACE_STYLE: Record<string, CSSProperties> = {
  // +Z anterior
  A: { transform: 'rotateY(0deg) translateZ(52px)' },
  // −Z posterior
  P: { transform: 'rotateY(180deg) translateZ(52px)' },
  // +X patient left
  L: { transform: 'rotateY(90deg) translateZ(52px)' },
  // −X patient right
  R: { transform: 'rotateY(-90deg) translateZ(52px)' },
  // +Y head — CSS Y-down + matrix Y-flip → use +90° so H faces camera from above
  H: { transform: 'rotateX(90deg) translateZ(52px)' },
  // −Y bottom
  B: { transform: 'rotateX(-90deg) translateZ(52px)' },
}

const FACE_COLOR: Record<string, string> = {
  A: '#1a4a6e',
  P: '#1a3355',
  L: '#1a4a3a',
  R: '#1a4035',
  H: '#5a2a2a',
  B: '#3d1a1a',
}

export default function OrientationCube() {
  const cubeRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(cameraBridge.activeFaceId)

  useEffect(() => {
    cameraBridge.cubeEl = cubeRef.current
    const unsub = cameraBridge.subscribeActiveFace(setActive)
    return () => {
      cameraBridge.cubeEl = null
      unsub()
    }
  }, [])

  return (
    <div
      className="orientation-cube-overlay"
      aria-label="人体方位立方体 A/P/L/R/H/B"
      title="立方体 = 人体：正对心脏看前面(A)，俯视看H，仰视看B"
    >
      <div className="orientation-cube-scene">
        <div className="orientation-cube" ref={cubeRef}>
          {ORIENTATION_FACES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={
                'orientation-cube-face' +
                (active === f.id ? ' orientation-cube-face--active' : '')
              }
              title={`${f.titleZh} · ${f.title}`}
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
  const [active, setActive] = useState(cameraBridge.activeFaceId)

  useEffect(() => cameraBridge.subscribeActiveFace(setActive), [])

  return (
    <div
      className="orientation-legend"
      role="group"
      aria-label="按人体方位跳转视角"
    >
      {ORIENTATION_FACES.map((f) => (
        <button
          key={f.id}
          type="button"
          title={`${f.titleZh} · ${f.title}`}
          className={
            active === f.id ? 'orientation-legend-btn--active' : undefined
          }
          onClick={() => cameraBridge.requestFace(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
