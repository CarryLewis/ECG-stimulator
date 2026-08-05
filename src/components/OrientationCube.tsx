import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useLanguage, type UiMessageKey } from '../i18n'

/**
 * Body-axis orientation gizmo for the 3D heart.
 *
 *   +x patient left · +y superior (head) · +z anterior
 *
 * The letter facing the viewer is the side you look from:
 *   top→H  bottom→B  left→L  right→R  front→A  back→P
 */

export interface CubeFaceDef {
  id: string
  label: string
  normal: Vector3
  titleKey: UiMessageKey
  theta: number
  phi: number
  /** Distinct face fill — gizmo must read as six different sides. */
  color: string
  accent: string
}

/** Half-extent of each CSS face (px). Keep in sync with FACE_STYLE translateZ. */
const CUBE_HALF = 46

export const ORIENTATION_FACES: CubeFaceDef[] = [
  {
    id: 'A',
    label: 'A',
    titleKey: 'faceAnterior',
    normal: new Vector3(0, 0, 1),
    theta: 0,
    phi: Math.PI / 2,
    color: '#1e4d7a',
    accent: '#7eb8ff',
  },
  {
    id: 'P',
    label: 'P',
    titleKey: 'facePosterior',
    normal: new Vector3(0, 0, -1),
    theta: Math.PI,
    phi: Math.PI / 2,
    color: '#3a2a5c',
    accent: '#c4a8ff',
  },
  {
    id: 'L',
    label: 'L',
    titleKey: 'faceLeft',
    normal: new Vector3(1, 0, 0),
    theta: Math.PI / 2,
    phi: Math.PI / 2,
    color: '#0d5c4a',
    accent: '#5dffc8',
  },
  {
    id: 'R',
    label: 'R',
    titleKey: 'faceRight',
    normal: new Vector3(-1, 0, 0),
    theta: -Math.PI / 2,
    phi: Math.PI / 2,
    color: '#0a4a6e',
    accent: '#5bc8ff',
  },
  {
    id: 'H',
    label: 'H',
    titleKey: 'faceHead',
    normal: new Vector3(0, 1, 0),
    theta: 0,
    phi: 0.12,
    color: '#7a2030',
    accent: '#ff8fa0',
  },
  {
    id: 'B',
    label: 'B',
    titleKey: 'faceBottom',
    normal: new Vector3(0, -1, 0),
    theta: 0,
    phi: Math.PI - 0.12,
    color: '#6a4a12',
    accent: '#ffd06a',
  },
]

const _offset = new Vector3()
const _target = new Vector3()

export const cameraBridge = {
  pendingFaceId: null as string | null,
  activeFaceId: null as string | null,
  requestFace(id: string) {
    this.pendingFaceId = id
  },
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

export function CameraSync() {
  const { camera, controls } = useThree()
  const listenersRef = useRef(false)

  useFrame(() => {
    const orbit = isOrbitControls(controls) ? controls : null

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
        const look = _target.copy(orbit.target)
        const dist = Math.max(camera.position.distanceTo(look), 0.5)
        const prevDamping = orbit.enableDamping
        orbit.enableDamping = false
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
      const theta = Math.atan2(_offset.x, _offset.z)
      const phi = Math.acos(MathUtils.clamp(_offset.y / radius, -1, 1))
      if (el) {
        el.style.transform = `rotateX(${-((phi - Math.PI / 2))}rad) rotateY(${-theta}rad)`
        const active = cameraBridge.activeFaceId
        for (const node of el.querySelectorAll<HTMLElement>('.orientation-cube-face')) {
          node.classList.toggle(
            'orientation-cube-face--active',
            node.dataset.faceId === active,
          )
        }
      }
    }
  })

  return null
}

/**
 * CSS face placement at identity (A toward viewer).
 * CSS Y points down. Empirically with the camera→CSS sync
 * `rotateX(-(phi-π/2)) rotateY(-theta)`:
 *   superior (+Y / H) must use rotateX(-90deg),
 *   inferior (−Y / B) must use rotateX(+90deg).
 */
const FACE_STYLE: Record<string, CSSProperties> = {
  A: { transform: `translateZ(${CUBE_HALF}px)` },
  P: { transform: `rotateY(180deg) translateZ(${CUBE_HALF}px)` },
  L: { transform: `rotateY(90deg) translateZ(${CUBE_HALF}px)` },
  R: { transform: `rotateY(-90deg) translateZ(${CUBE_HALF}px)` },
  H: { transform: `rotateX(-90deg) translateZ(${CUBE_HALF}px)` },
  B: { transform: `rotateX(90deg) translateZ(${CUBE_HALF}px)` },
}

/** Redesigned orientation cube — six color-coded anatomical faces. */
export default function OrientationCube() {
  const { t } = useLanguage()
  const cubeRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    cameraBridge.cubeEl = cubeRef.current
    return () => {
      cameraBridge.cubeEl = null
    }
  }, [])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setActiveId(cameraBridge.activeFaceId)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const activeFace = ORIENTATION_FACES.find((f) => f.id === activeId)

  return (
    <div
      className="orientation-cube-overlay"
      aria-label={t('orientationCube')}
      title={t('orientationCubeHint')}
    >
      <div className="orientation-cube-banner">{t('orientationCubeBanner')}</div>
      <div className="orientation-cube-scene">
        <div
          className="orientation-cube"
          ref={cubeRef}
          style={{ width: CUBE_HALF * 2, height: CUBE_HALF * 2 }}
        >
          {ORIENTATION_FACES.map((f) => (
            <button
              key={f.id}
              type="button"
              className="orientation-cube-face"
              data-face-id={f.id}
              title={`${f.label} — ${t(f.titleKey)}`}
              style={{
                ...FACE_STYLE[f.id],
                width: CUBE_HALF * 2,
                height: CUBE_HALF * 2,
                margin: `-${CUBE_HALF}px 0 0 -${CUBE_HALF}px`,
                background: f.color,
                borderColor: f.accent,
                color: f.accent,
              }}
              onClick={() => cameraBridge.requestFace(f.id)}
            >
              <span className="orientation-cube-face-letter">{f.label}</span>
              <span className="orientation-cube-face-caption">{t(f.titleKey)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="orientation-cube-status" aria-live="polite">
        {activeFace ? (
          <>
            <span
              className="orientation-cube-status-swatch"
              style={{ background: activeFace.accent }}
            />
            <span className="orientation-cube-status-id">{activeFace.label}</span>
            <span className="orientation-cube-status-name">
              {t(activeFace.titleKey)}
            </span>
          </>
        ) : (
          <span className="orientation-cube-status-name">{t('orientationCubeIdle')}</span>
        )}
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
          title={`${f.label} — ${t(f.titleKey)}`}
          className={
            activeId === f.id ? 'orientation-legend-btn--active' : undefined
          }
          style={
            activeId === f.id
              ? { borderColor: f.accent, color: f.accent }
              : { borderColor: `${f.accent}66`, color: f.accent }
          }
          onClick={() => cameraBridge.requestFace(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
