import { useMemo } from 'react'
import type { ConductionState } from '../../ecg/types'
import { HEART_MEDIASTINUM_POSE } from './heartAsset'

/**
 * Anatomical heart for V3 — procedural cutaway myocardium seated in the
 * mediastinum. GLB loading is opt-in via HEART_GLB_MODE in heartAsset.ts
 * (kept off by default so a missing file cannot blank the canvas).
 */
export default function RealisticHeart({ state }: { state: ConductionState }) {
  return <ProceduralCutawayHeart state={state} />
}

/**
 * Procedural stand-in: frontal cutaway, left-of-midline mediastinal seat,
 * aorta (red) + pulmonary trunk (blue). Sized to read clearly inside the
 * translucent body contour.
 */
export function ProceduralCutawayHeart({ state }: { state: ConductionState }) {
  const beat = useMemo(
    () => 1 + state.ventricle * 0.05 + state.atria * 0.02,
    [state.atria, state.ventricle],
  )
  const myoGlow = 0.12 + state.ventricle * 0.4

  return (
    <group
      position={HEART_MEDIASTINUM_POSE.position}
      rotation={HEART_MEDIASTINUM_POSE.rotation}
      scale={HEART_MEDIASTINUM_POSE.scale * beat}
    >
      {/* Right atrium */}
      <mesh position={[-0.55, 0.55, 0.12]} castShadow>
        <sphereGeometry args={[0.48, 32, 24]} />
        <meshStandardMaterial
          color="#9a3a46"
          roughness={0.5}
          metalness={0.08}
          emissive="#6b2030"
          emissiveIntensity={0.08 + state.atria * 0.4}
        />
      </mesh>
      {/* Left atrium */}
      <mesh position={[0.5, 0.58, 0.02]} castShadow>
        <sphereGeometry args={[0.46, 32, 24]} />
        <meshStandardMaterial
          color="#a84450"
          roughness={0.48}
          metalness={0.08}
          emissive="#6b2030"
          emissiveIntensity={0.08 + state.atria * 0.4}
        />
      </mesh>

      {/* Right ventricle */}
      <mesh
        position={[-0.38, -0.18, 0.2]}
        scale={[0.95, 1.2, 0.9]}
        castShadow
      >
        <sphereGeometry args={[0.68, 36, 28]} />
        <meshStandardMaterial
          color="#8a343e"
          roughness={0.45}
          metalness={0.1}
          emissive="#b33"
          emissiveIntensity={myoGlow * 0.65}
        />
      </mesh>
      {/* Left ventricle */}
      <mesh
        position={[0.35, -0.25, 0.06]}
        scale={[1.1, 1.4, 1.05]}
        castShadow
      >
        <sphereGeometry args={[0.78, 40, 32]} />
        <meshStandardMaterial
          color="#b04452"
          roughness={0.42}
          metalness={0.12}
          emissive="#d44"
          emissiveIntensity={myoGlow}
        />
      </mesh>

      {/* Cutaway cavity cue */}
      <mesh position={[0.05, -0.22, 0.58]} scale={[1.0, 1.15, 0.18]}>
        <sphereGeometry args={[0.58, 24, 16]} />
        <meshStandardMaterial
          color="#3a1018"
          roughness={0.7}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Apex */}
      <mesh position={[0.14, -1.1, 0.1]} scale={[0.75, 0.58, 0.7]}>
        <sphereGeometry args={[0.55, 24, 18]} />
        <meshStandardMaterial
          color="#9a3c48"
          roughness={0.48}
          emissive="#b33"
          emissiveIntensity={myoGlow * 0.75}
        />
      </mesh>

      {/* Aorta */}
      <mesh position={[-0.05, 1.1, -0.05]} rotation={[0.25, 0, 0.2]}>
        <cylinderGeometry args={[0.14, 0.17, 0.75, 16]} />
        <meshStandardMaterial color="#d32f2f" roughness={0.38} metalness={0.15} />
      </mesh>
      <mesh position={[0.28, 1.4, -0.15]} rotation={[0.1, 0.4, 1.2]}>
        <torusGeometry args={[0.3, 0.1, 12, 24, Math.PI * 0.85]} />
        <meshStandardMaterial color="#d32f2f" roughness={0.38} metalness={0.15} />
      </mesh>

      {/* Pulmonary trunk */}
      <mesh position={[0.16, 0.98, 0.14]} rotation={[-0.3, 0.2, -0.35]}>
        <cylinderGeometry args={[0.11, 0.13, 0.48, 14]} />
        <meshStandardMaterial color="#3b6ea5" roughness={0.42} metalness={0.1} />
      </mesh>
      <mesh position={[-0.28, 1.08, 0.06]} rotation={[0.1, 0, 1.1]}>
        <cylinderGeometry args={[0.075, 0.095, 0.42, 12]} />
        <meshStandardMaterial color="#3b6ea5" roughness={0.42} />
      </mesh>
      <mesh position={[0.48, 1.02, -0.04]} rotation={[0.1, 0, -1.0]}>
        <cylinderGeometry args={[0.075, 0.095, 0.42, 12]} />
        <meshStandardMaterial color="#3b6ea5" roughness={0.42} />
      </mesh>

      {/* Coronary cues */}
      <mesh position={[0.58, -0.08, 0.48]} rotation={[0.4, 0.3, 0.2]}>
        <torusGeometry args={[0.38, 0.028, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#9b1c1c" roughness={0.5} />
      </mesh>
      <mesh position={[-0.18, -0.38, 0.58]} rotation={[0.6, -0.2, 0]}>
        <torusGeometry args={[0.42, 0.022, 8, 20, Math.PI * 0.7]} />
        <meshStandardMaterial color="#2f5f8f" roughness={0.5} />
      </mesh>

      {/* SA / AV */}
      <mesh position={[0.05, 0.78, 0.38]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshStandardMaterial
          color="#3dff8a"
          emissive="#3dff8a"
          emissiveIntensity={0.4 + state.sa * 1.6}
        />
      </mesh>
      <mesh position={[0.0, 0.18, 0.14]}>
        <sphereGeometry args={[0.065, 12, 10]} />
        <meshStandardMaterial
          color={state.avConducts ? '#3dff8a' : '#f87171'}
          emissive={state.avConducts ? '#3dff8a' : '#f87171'}
          emissiveIntensity={0.4 + state.av * 1.5}
        />
      </mesh>
    </group>
  )
}
