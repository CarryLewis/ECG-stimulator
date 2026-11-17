import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { HEART_STRUCTURES } from '../../anatomy/heartStructures'
import type { HeartStructureId } from '../../anatomy/types'
import type { ConductionState } from '../../ecg/types'
import HeartStructureMesh from './HeartStructureMesh'
import SourceLabels from './SourceLabels'
import { cameraBridge } from '../OrientationCube'

interface Props {
  selectedId: HeartStructureId | null
  myocardiumOpacity: number
  showLabels: boolean
  onSelect: (id: HeartStructureId | null) => void
  conduction?: ConductionState
}

function activationFor(id: HeartStructureId, s: ConductionState | undefined): number {
  if (!s) return 0
  switch (id) {
    case 'right_atrium': case 'left_atrium': return Math.max(s.atrialDepol, s.atria * 0.5)
    case 'septum': return Math.abs(s.septalDepol)
    case 'apex': return Math.abs(s.apicalDepol)
    case 'right_ventricle': case 'left_ventricle':
      return Math.max(Math.abs(s.apicalDepol), Math.abs(s.basalDepol), s.ventricle * 0.3)
  }
}

export default function AnatomicalHeart({ selectedId, myocardiumOpacity, showLabels, onSelect, conduction }: Props) {
  const cutaway = selectedId === 'septum'
  useEffect(() => {
    if (cutaway) cameraBridge.requestFace('A')
  }, [cutaway])
  return (
    <group>
      <GreatVessels opacity={myocardiumOpacity} />
      {HEART_STRUCTURES.map(def => (
        <HeartStructureMesh key={def.id} def={def}
          selected={selectedId === def.id}
          dimmed={selectedId !== null && selectedId !== def.id && !(cutaway && def.id.includes('ventricle'))}
          myocardiumOpacity={myocardiumOpacity}
          activation={activationFor(def.id, conduction)}
          repolarization={def.id.includes('ventricle') || def.id === 'apex' ? conduction?.repol : 0}
          cutaway={cutaway}
          onSelect={id => onSelect(selectedId === id ? null : id)} />
      ))}
      {showLabels && <SourceLabels selectedId={selectedId} onSelect={onSelect} />}
    </group>
  )
}

function Vessel({ points, color, radius, opacity }: {
  points: [number, number, number][]; color: string; radius: number; opacity: number
}) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), [points])
  return <mesh>
    <tubeGeometry args={[curve, 48, radius, 16, false]} />
    <meshStandardMaterial color={color} roughness={0.7} transparent opacity={opacity} side={THREE.DoubleSide} />
  </mesh>
}
const AORTA: [number, number, number][] = [[0.02, 0.43, -0.09], [0, 0.94, -0.14], [0.17, 1.31, -0.2], [0.44, 1.35, -0.29], [0.65, 1.09, -0.39], [0.64, 0.63, -0.42]]
const PULMONARY: [number, number, number][] = [[-0.3, 0.36, 0.28], [-0.25, 0.78, 0.31], [-0.13, 1.03, 0.26], [-0.36, 1.16, 0.12]]
const CAVA: [number, number, number][] = [[-0.55, 0.66, 0], [-0.6, 1.04, -0.02], [-0.62, 1.3, -0.05]]
function GreatVessels({ opacity }: { opacity: number }) {
  return <group>
    <Vessel points={AORTA} color="#c77e77" radius={0.1} opacity={opacity} />
    <Vessel points={PULMONARY} color="#759ba8" radius={0.115} opacity={opacity} />
    <Vessel points={CAVA} color="#698b9d" radius={0.105} opacity={opacity} />
  </group>
}
