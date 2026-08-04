/**
 * 3D cardiac visualization with instantaneous dipole overlay.
 * Renders anatomy via existing heart mesh; vector math stays in /simulation.
 */

import { Line, Text } from '@react-three/drei'
import { useMemo } from 'react'
import type { CardiacVector } from '../simulation/types'
import { dipoleToAnatomyScene } from '../simulation/cardiacModel'
import AnatomicalHeart from '../components/anatomy/AnatomicalHeart'
import type { ConductionState } from '../ecg/types'
import type { HeartStructureId } from '../anatomy/types'

interface Heart3DProps {
  dipole: CardiacVector
  conduction: ConductionState
  selectedStructureId: HeartStructureId | null
  onSelectStructure: (id: HeartStructureId | null) => void
  myocardiumOpacity: number
  showLabels: boolean
}

function DipoleArrow({ dipole }: { dipole: CardiacVector }) {
  const { points, tip, len } = useMemo(() => {
    const v = dipoleToAnatomyScene(dipole)
    const mag = Math.hypot(v.x, v.y, v.z)
    const scale = 1.1
    const end: [number, number, number] = [
      v.x * scale,
      v.y * scale,
      v.z * scale,
    ]
    return {
      points: [
        [0, 0, 0] as [number, number, number],
        end,
      ],
      tip: end,
      len: mag,
    }
  }, [dipole])

  if (len < 0.04) return null

  return (
    <group>
      <Line
        points={points}
        color="#fbbf24"
        lineWidth={2.5}
        transparent
        opacity={0.95}
      />
      <mesh position={tip}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.6}
        />
      </mesh>
      <Text
        position={[tip[0] * 1.15, tip[1] * 1.15, tip[2] * 1.15]}
        fontSize={0.14}
        color="#fde68a"
        anchorX="center"
        anchorY="middle"
      >
        M(t)
      </Text>
    </group>
  )
}

export default function Heart3D({
  dipole,
  conduction,
  selectedStructureId,
  onSelectStructure,
  myocardiumOpacity,
  showLabels,
}: Heart3DProps) {
  return (
    <group>
      <AnatomicalHeart
        selectedId={selectedStructureId}
        onSelect={onSelectStructure}
        myocardiumOpacity={myocardiumOpacity}
        showLabels={showLabels}
        conduction={conduction}
      />
      <DipoleArrow dipole={dipole} />
    </group>
  )
}
