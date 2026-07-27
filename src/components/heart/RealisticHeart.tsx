import { useGLTF } from '@react-three/drei'
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import type { Object3D } from 'three'
import type { ConductionState } from '../../ecg/types'
import {
  HEART_GLB_MODE,
  HEART_MEDIASTINUM_POSE,
  REALISTIC_HEART_GLB,
} from './heartAsset'

/**
 * Anatomical heart for V3.
 * Drop a GLB at `public/models/heart-animated-realistic.glb` — it loads
 * automatically. Missing / broken files fall back to the procedural cutaway.
 */
export default function RealisticHeart({ state }: { state: ConductionState }) {
  if (HEART_GLB_MODE === 'off') {
    return <ProceduralCutawayHeart state={state} />
  }

  return (
    <GlbErrorBoundary fallback={<ProceduralCutawayHeart state={state} />}>
      <Suspense fallback={<ProceduralCutawayHeart state={state} />}>
        <GltfHeartModel state={state} />
      </Suspense>
    </GlbErrorBoundary>
  )
}

function GltfHeartModel({ state }: { state: ConductionState }) {
  const { scene } = useGLTF(REALISTIC_HEART_GLB)
  const cloned = useMemo(() => scene.clone(true), [scene])
  const beat = useMemo(
    () => 1 + state.ventricle * 0.045 + state.atria * 0.02,
    [state.atria, state.ventricle],
  )

  useEffect(() => {
    cloned.traverse((obj: Object3D) => {
      const mesh = obj as Object3D & {
        isMesh?: boolean
        castShadow?: boolean
        receiveShadow?: boolean
      }
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
  }, [cloned])

  return (
    <primitive
      object={cloned}
      position={HEART_MEDIASTINUM_POSE.position}
      rotation={HEART_MEDIASTINUM_POSE.rotation}
      scale={HEART_MEDIASTINUM_POSE.scale * beat}
    />
  )
}

/** Catch failed GLB loads / parses and keep the teaching UI alive. */
class GlbErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(
      '[RealisticHeart] GLB unavailable; using procedural heart.',
      REALISTIC_HEART_GLB,
      error,
      info,
    )
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}

/**
 * Procedural stand-in: frontal cutaway, left-of-midline mediastinal seat,
 * aorta (red) + pulmonary trunk (blue).
 */
export function ProceduralCutawayHeart({ state }: { state: ConductionState }) {
  const beat = useMemo(
    () => 1 + state.ventricle * 0.045 + state.atria * 0.02,
    [state.atria, state.ventricle],
  )
  const myoGlow = 0.08 + state.ventricle * 0.35

  return (
    <group
      position={HEART_MEDIASTINUM_POSE.position}
      rotation={HEART_MEDIASTINUM_POSE.rotation}
      scale={HEART_MEDIASTINUM_POSE.scale * beat}
    >
      <mesh position={[-0.55, 0.55, 0.12]} castShadow>
        <sphereGeometry args={[0.42, 28, 22]} />
        <meshStandardMaterial
          color="#8f3a44"
          roughness={0.55}
          metalness={0.08}
          emissive="#5c1f28"
          emissiveIntensity={0.05 + state.atria * 0.35}
        />
      </mesh>
      <mesh position={[0.48, 0.58, 0.02]} castShadow>
        <sphereGeometry args={[0.4, 28, 22]} />
        <meshStandardMaterial
          color="#9a404a"
          roughness={0.52}
          metalness={0.08}
          emissive="#5c1f28"
          emissiveIntensity={0.05 + state.atria * 0.35}
        />
      </mesh>

      <mesh
        position={[-0.38, -0.2, 0.18]}
        scale={[0.9, 1.15, 0.85]}
        castShadow
      >
        <sphereGeometry args={[0.62, 32, 26]} />
        <meshStandardMaterial
          color="#7a3038"
          roughness={0.5}
          metalness={0.1}
          emissive="#a33"
          emissiveIntensity={myoGlow * 0.6}
        />
      </mesh>
      <mesh
        position={[0.32, -0.28, 0.05]}
        scale={[1.05, 1.35, 1.0]}
        castShadow
      >
        <sphereGeometry args={[0.7, 36, 28]} />
        <meshStandardMaterial
          color="#a03c48"
          roughness={0.45}
          metalness={0.12}
          emissive="#c44"
          emissiveIntensity={myoGlow}
        />
      </mesh>

      <mesh position={[0.05, -0.25, 0.55]} scale={[0.95, 1.1, 0.15]}>
        <sphereGeometry args={[0.55, 24, 16]} />
        <meshStandardMaterial
          color="#4a1520"
          roughness={0.7}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh position={[0.12, -1.05, 0.08]} scale={[0.7, 0.55, 0.65]}>
        <sphereGeometry args={[0.5, 24, 18]} />
        <meshStandardMaterial
          color="#8a343e"
          roughness={0.5}
          emissive="#a33"
          emissiveIntensity={myoGlow * 0.7}
        />
      </mesh>

      <mesh position={[-0.05, 1.05, -0.05]} rotation={[0.25, 0, 0.2]}>
        <cylinderGeometry args={[0.13, 0.16, 0.7, 16]} />
        <meshStandardMaterial color="#c62828" roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[0.25, 1.35, -0.15]} rotation={[0.1, 0.4, 1.2]}>
        <torusGeometry args={[0.28, 0.09, 12, 24, Math.PI * 0.85]} />
        <meshStandardMaterial color="#c62828" roughness={0.4} metalness={0.15} />
      </mesh>

      <mesh position={[0.15, 0.95, 0.12]} rotation={[-0.3, 0.2, -0.35]}>
        <cylinderGeometry args={[0.1, 0.12, 0.45, 14]} />
        <meshStandardMaterial color="#3b6ea5" roughness={0.45} metalness={0.1} />
      </mesh>
      <mesh position={[-0.25, 1.05, 0.05]} rotation={[0.1, 0, 1.1]}>
        <cylinderGeometry args={[0.07, 0.09, 0.4, 12]} />
        <meshStandardMaterial color="#3b6ea5" roughness={0.45} />
      </mesh>
      <mesh position={[0.45, 1.0, -0.05]} rotation={[0.1, 0, -1.0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.4, 12]} />
        <meshStandardMaterial color="#3b6ea5" roughness={0.45} />
      </mesh>

      <mesh position={[0.55, -0.1, 0.45]} rotation={[0.4, 0.3, 0.2]}>
        <torusGeometry args={[0.35, 0.025, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#9b1c1c" roughness={0.5} />
      </mesh>
      <mesh position={[-0.2, -0.4, 0.55]} rotation={[0.6, -0.2, 0]}>
        <torusGeometry args={[0.4, 0.02, 8, 20, Math.PI * 0.7]} />
        <meshStandardMaterial color="#2f5f8f" roughness={0.5} />
      </mesh>

      <mesh position={[0.05, 0.75, 0.35]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial
          color="#3dff8a"
          emissive="#3dff8a"
          emissiveIntensity={0.35 + state.sa * 1.6}
        />
      </mesh>
      <mesh position={[0.0, 0.15, 0.12]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshStandardMaterial
          color={state.avConducts ? '#3dff8a' : '#f87171'}
          emissive={state.avConducts ? '#3dff8a' : '#f87171'}
          emissiveIntensity={0.35 + state.av * 1.5}
        />
      </mesh>
    </group>
  )
}
