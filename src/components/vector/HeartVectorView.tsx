import { Html } from '@react-three/drei'
import type { ConductionState } from '../../ecg/types'
import type {
  InstantaneousElectricalField,
  MeanElectricalAxis,
} from '../../vector-engine'
import ElectricalVectorArrows from './ElectricalVectorArrows'

interface HeartVectorViewProps {
  state: ConductionState
  field: InstantaneousElectricalField
  axis: MeanElectricalAxis
  activationIntensity: number
  showLabels: boolean
}

/**
 * Dedicated teaching scene: schematic myocardium + electrical vectors.
 * Explains how activation creates the field that the ECG samples.
 */
export default function HeartVectorView({
  state,
  field,
  axis,
  activationIntensity,
  showLabels,
}: HeartVectorViewProps) {
  const myoGlow =
    0.15 +
    state.ventricle * 0.55 +
    state.apicalDepol * 0.35 +
    state.septalDepol * 0.2

  return (
    <group>
      {/* Soft myocardium silhouette */}
      <mesh position={[0.08, -0.25, 0]} rotation={[0.15, 0.35, 0.1]}>
        <sphereGeometry args={[0.95, 28, 22]} />
        <meshStandardMaterial
          color="#8b3a44"
          emissive="#d0606c"
          emissiveIntensity={myoGlow}
          transparent
          opacity={0.42}
          roughness={0.65}
          metalness={0.05}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-0.35, -0.05, 0.1]} rotation={[0.1, -0.2, -0.15]} scale={[0.7, 0.55, 0.65]}>
        <sphereGeometry args={[0.7, 20, 16]} />
        <meshStandardMaterial
          color="#6b3038"
          emissive="#c07078"
          emissiveIntensity={0.1 + state.atria * 0.7}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Frontal-plane reference ring for MEA */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <ringGeometry args={[1.35, 1.42, 64]} />
        <meshBasicMaterial color="#334155" transparent opacity={0.55} />
      </mesh>
      {/* Lead I / aVF tick marks */}
      <mesh position={[1.5, -0.35, 0]}>
        <boxGeometry args={[0.18, 0.03, 0.03]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, -1.85, 0]}>
        <boxGeometry args={[0.03, 0.18, 0.03]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>
      {showLabels && (
        <>
          <Html position={[1.75, -0.35, 0]} center style={{ pointerEvents: 'none' }}>
            <span className="vector-axis-tick">I (+)</span>
          </Html>
          <Html position={[0, -2.1, 0]} center style={{ pointerEvents: 'none' }}>
            <span className="vector-axis-tick">aVF (+)</span>
          </Html>
        </>
      )}

      <ElectricalVectorArrows
        field={field}
        axis={axis}
        activationIntensity={activationIntensity}
        showContributions
      />
    </group>
  )
}
