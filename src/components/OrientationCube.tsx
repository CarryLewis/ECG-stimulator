import { useEffect, useRef, type CSSProperties } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { cameraBridge, ORIENTATION_FACES } from './orientationBridge'

/**
 * DOM / CSS orientation cube — no second WebGL context.
 *
 * History: a priority>0 useFrame inside the heart Canvas disabled R3F’s
 * automatic scene render (labels only). A separate overlay Canvas then caused
 * WebGL context loss on software GL. This CSS cube avoids both failure modes.
 */

const _q = new Quaternion()
const _v = new Vector3()
const _m = new Matrix4()
const _inv = new Quaternion()

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

    const pending = cameraBridge.pendingFaceId
    if (pending) {
      const face = ORIENTATION_FACES.find((f) => f.id === pending)
      cameraBridge.pendingFaceId = null
      if (face) {
        const dist = camera.position.length()
        const pos = face.normal.clone().multiplyScalar(dist)
        const up =
          Math.abs(face.normal.y) > 0.9
            ? new Vector3(0, 0, -Math.sign(face.normal.y))
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
      _q.slerp(anim.targetQuat, 0.12)
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

    // Drive CSS cube (inverse camera → world axes stay readable on the gizmo).
    const el = cameraBridge.cubeEl
    if (el) {
      _inv.copy(camera.quaternion).invert()
      el.style.transform = `rotate3d(${_inv.x}, ${_inv.y}, ${_inv.z}, ${2 * Math.acos(Math.min(1, Math.max(-1, _inv.w)))}rad)`
    }
  })

  return null
}

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
      aria-label="Orientation cube A/P/L/R/H/B"
    >
      <div className="orientation-cube-scene">
        <div className="orientation-cube" ref={cubeRef}>
          {ORIENTATION_FACES.map((f) => (
            <button
              key={f.id}
              type="button"
              className="orientation-cube-face"
              title={f.title}
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
  return (
    <div
      className="orientation-legend"
      role="group"
      aria-label="Snap orientation"
    >
      {ORIENTATION_FACES.map((f) => (
        <button
          key={f.id}
          type="button"
          title={f.title}
          onClick={() => cameraBridge.requestFace(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
