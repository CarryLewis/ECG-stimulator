import { useMemo } from 'react'
import type { ConductionState } from '../../ecg/types'
import { HEART_MEDIASTINUM_POSE } from './heartAsset'

/**
 * Anatomical heart for V3 — procedural cutaway myocardium seated in the
 * mediastinum. Lit brightly so chambers / vessels read through the body shell.
 */
export default function RealisticHeart({ state }: { state: ConductionState }) {
  return <ProceduralCutawayHeart state={state} />
}

/**
 * Bright procedural cutaway: atria, ventricles, aorta, pulmonary trunk.
 * Higher albedo + emissive so structure stays clear on the dark UI.
 */
export function ProceduralCutawayHeart({ state }: { state: ConductionState }) {
  const beat = useMemo(
    () => 1 + state.ventricle * 0.05 + state.atria * 0.02,
    [state.atria, state.ventricle],
  )
  const myoGlow = 0.35 + state.ventricle * 0.55
  const atriaGlow = 0.28 + state.atria * 0.5

  return (
    <group
      position={HEART_MEDIASTINUM_POSE.position}
      rotation={HEART_MEDIASTINUM_POSE.rotation}
      scale={HEART_MEDIASTINUM_POSE.scale * beat}
    >
      {/* Local fill so the heart stays readable inside the translucent body */}
      <pointLight
        position={[0.2, 0.4, 1.2]}
        intensity={1.35}
        distance={4.5}
        color="#ffe8e0"
      />
      <pointLight
        position={[-0.8, 0.6, 0.6]}
        intensity={0.55}
        distance={3.5}
        color="#ffc8c0"
      />

      {/* Right atrium */}
      <mesh position={[-0.55, 0.55, 0.12]} castShadow>
        <sphereGeometry args={[0.48, 32, 24]} />
        <meshStandardMaterial
          color="#e0707c"
          roughness={0.38}
          metalness={0.06}
          emissive="#c04050"
          emissiveIntensity={atriaGlow}
        />
      </mesh>
      {/* Left atrium */}
      <mesh position={[0.5, 0.58, 0.02]} castShadow>
        <sphereGeometry args={[0.46, 32, 24]} />
        <meshStandardMaterial
          color="#e87884"
          roughness={0.36}
          metalness={0.06}
          emissive="#c04050"
          emissiveIntensity={atriaGlow}
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
          color="#d05060"
          roughness={0.34}
          metalness={0.08}
          emissive="#e05060"
          emissiveIntensity={myoGlow * 0.7}
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
          color="#ef6674"
          roughness={0.32}
          metalness={0.1}
          emissive="#f06070"
          emissiveIntensity={myoGlow}
        />
      </mesh>

      {/* Cutaway cavity — darker for contrast against bright walls */}
      <mesh position={[0.05, -0.22, 0.58]} scale={[1.0, 1.15, 0.18]}>
        <sphereGeometry args={[0.58, 24, 16]} />
        <meshStandardMaterial
          color="#4a1820"
          roughness={0.65}
          emissive="#2a0c12"
          emissiveIntensity={0.15}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Apex */}
      <mesh position={[0.14, -1.1, 0.1]} scale={[0.75, 0.58, 0.7]}>
        <sphereGeometry args={[0.55, 24, 18]} />
        <meshStandardMaterial
          color="#e05868"
          roughness={0.36}
          emissive="#e05060"
          emissiveIntensity={myoGlow * 0.85}
        />
      </mesh>

      {/* Aorta — vivid red */}
      <mesh position={[-0.05, 1.1, -0.05]} rotation={[0.25, 0, 0.2]}>
        <cylinderGeometry args={[0.14, 0.17, 0.75, 16]} />
        <meshStandardMaterial
          color="#ff5252"
          roughness={0.28}
          metalness={0.18}
          emissive="#ff3030"
          emissiveIntensity={0.45}
        />
      </mesh>
      <mesh position={[0.28, 1.4, -0.15]} rotation={[0.1, 0.4, 1.2]}>
        <torusGeometry args={[0.3, 0.1, 12, 24, Math.PI * 0.85]} />
        <meshStandardMaterial
          color="#ff5252"
          roughness={0.28}
          metalness={0.18}
          emissive="#ff3030"
          emissiveIntensity={0.45}
        />
      </mesh>

      {/* Pulmonary trunk — vivid blue */}
      <mesh position={[0.16, 0.98, 0.14]} rotation={[-0.3, 0.2, -0.35]}>
        <cylinderGeometry args={[0.11, 0.13, 0.48, 14]} />
        <meshStandardMaterial
          color="#5b9fdf"
          roughness={0.32}
          metalness={0.12}
          emissive="#3a7fc0"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[-0.28, 1.08, 0.06]} rotation={[0.1, 0, 1.1]}>
        <cylinderGeometry args={[0.075, 0.095, 0.42, 12]} />
        <meshStandardMaterial
          color="#5b9fdf"
          roughness={0.32}
          emissive="#3a7fc0"
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[0.48, 1.02, -0.04]} rotation={[0.1, 0, -1.0]}>
        <cylinderGeometry args={[0.075, 0.095, 0.42, 12]} />
        <meshStandardMaterial
          color="#5b9fdf"
          roughness={0.32}
          emissive="#3a7fc0"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Coronary cues */}
      <mesh position={[0.58, -0.08, 0.48]} rotation={[0.4, 0.3, 0.2]}>
        <torusGeometry args={[0.38, 0.03, 8, 24, Math.PI]} />
        <meshStandardMaterial
          color="#ff6b6b"
          roughness={0.4}
          emissive="#ff4040"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[-0.18, -0.38, 0.58]} rotation={[0.6, -0.2, 0]}>
        <torusGeometry args={[0.42, 0.024, 8, 20, Math.PI * 0.7]} />
        <meshStandardMaterial
          color="#6aa8e8"
          roughness={0.4}
          emissive="#4080c8"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* SA / AV */}
      <mesh position={[0.05, 0.78, 0.38]}>
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshStandardMaterial
          color="#5dff9a"
          emissive="#3dff8a"
          emissiveIntensity={0.7 + state.sa * 1.8}
        />
      </mesh>
      <mesh position={[0.0, 0.18, 0.14]}>
        <sphereGeometry args={[0.075, 12, 10]} />
        <meshStandardMaterial
          color={state.avConducts ? '#5dff9a' : '#ff8080'}
          emissive={state.avConducts ? '#3dff8a' : '#f87171'}
          emissiveIntensity={0.7 + state.av * 1.6}
        />
      </mesh>
    </group>
  )
}
