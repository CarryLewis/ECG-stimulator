import { useMemo } from 'react'
import * as THREE from 'three'
import { HEART_STRUCTURES } from '../../anatomy/heartStructures'
import type { HeartStructureId } from '../../anatomy/types'
import HeartStructureMesh from './HeartStructureMesh'

interface AnatomicalHeartProps {
  selectedId: HeartStructureId | null
  myocardiumOpacity: number
  showLabels: boolean
  onSelect: (id: HeartStructureId | null) => void
}

/**
 * Biological source model: macroscopic chambers + septum + apex.
 * Oriented in patient body coordinates for future ECG coupling.
 */
export default function AnatomicalHeart({
  selectedId,
  myocardiumOpacity,
  showLabels,
  onSelect,
}: AnatomicalHeartProps) {
  const greatVessels = useMemo(() => <GreatVessels />, [])

  return (
    <group
      rotation={[0.22, -0.48, 0.08]}
      position={[0, 0.15, 0]}
      onClick={(e) => {
        // Click empty heart space clears only if not a structure (structures stopPropagation).
        e.stopPropagation()
      }}
    >
      {greatVessels}

      {HEART_STRUCTURES.map((def) => (
        <HeartStructureMesh
          key={def.id}
          def={def}
          selected={selectedId === def.id}
          dimmed={selectedId !== null && selectedId !== def.id}
          myocardiumOpacity={myocardiumOpacity}
          showLabel={showLabels}
          onSelect={(id) =>
            onSelect(selectedId === id ? null : id)
          }
        />
      ))}
    </group>
  )
}

/** Minimal aorta / pulmonary trunk cues — context, not interactive yet. */
function GreatVessels() {
  const aortaMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e85a5a',
        emissive: '#c03030',
        emissiveIntensity: 0.35,
        roughness: 0.35,
        metalness: 0.12,
        transparent: true,
        opacity: 0.85,
      }),
    [],
  )
  const paMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#5a8fc8',
        emissive: '#2a5a90',
        emissiveIntensity: 0.3,
        roughness: 0.38,
        metalness: 0.1,
        transparent: true,
        opacity: 0.8,
      }),
    [],
  )

  return (
    <group>
      {/* Ascending aorta */}
      <mesh position={[-0.05, 1.05, -0.05]} rotation={[0.28, 0, 0.18]} material={aortaMat}>
        <cylinderGeometry args={[0.11, 0.14, 0.55, 16]} />
      </mesh>
      {/* Aortic arch cue */}
      <mesh position={[0.22, 1.32, -0.12]} rotation={[0.05, 0.35, 1.15]} material={aortaMat}>
        <torusGeometry args={[0.26, 0.085, 10, 20, Math.PI * 0.85]} />
      </mesh>
      {/* Pulmonary trunk */}
      <mesh position={[0.14, 0.92, 0.16]} rotation={[-0.35, 0.15, -0.3]} material={paMat}>
        <cylinderGeometry args={[0.09, 0.11, 0.4, 14]} />
      </mesh>
    </group>
  )
}
