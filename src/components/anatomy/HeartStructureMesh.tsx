import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import SourceSelectionOutline from './SourceSelectionOutline'
import * as THREE from 'three'
import type { HeartStructureDef } from '../../anatomy/types'
import { createSourceGeometry, SOURCE_ANCHORS } from '../../anatomy/sourceGeometry'

interface Props {
  def: HeartStructureDef
  selected: boolean
  dimmed: boolean
  myocardiumOpacity: number
  activation?: number
  repolarization?: number
  cutaway?: boolean
  onSelect: (id: HeartStructureDef['id']) => void
}

export default function HeartStructureMesh({
  def, selected, dimmed, myocardiumOpacity, activation = 0,
  repolarization = 0, cutaway = false, onSelect,
}: Props) {
  const landmark = def.id === 'apex'
  const geometry = useMemo(
    () => landmark ? new THREE.SphereGeometry(0.035, 20, 16) : createSourceGeometry(def.id, cutaway),
    [def.id, cutaway, landmark],
  )
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => { document.body.style.cursor = 'auto' }, [])
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const electricalColor = useMemo(() => new THREE.Color(), [])
  const depolColor = useMemo(() => new THREE.Color('#e7b96a'), [])
  const repolColor = useMemo(() => new THREE.Color('#739ee8'), [])
  const baseOpacity = Math.max(0.2, Math.min(1, myocardiumOpacity))
  const targetOpacity = landmark ? (selected ? 1 : 0) : baseOpacity * (dimmed ? 0.55 : 1)
  useFrame((_, delta) => {
    if (!material.current) return
    material.current.opacity = THREE.MathUtils.damp(material.current.opacity, targetOpacity, 12, delta)
    const repol = Math.max(0, repolarization)
    const depol = Math.max(0, Math.min(1, activation))
    electricalColor.copy(depolColor).lerp(repolColor, repol / Math.max(0.001, repol + depol))
    material.current.emissive.copy(electricalColor)
    // Selection never changes electrical brightness or overrides the opacity control.
    material.current.emissiveIntensity = Math.max(depol, repol) * 0.62
  })
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect(def.id)
  }

  return (
    <group>
      <mesh
        visible={def.id !== 'septum' || cutaway || baseOpacity < 0.6}
        geometry={geometry}
        position={landmark ? SOURCE_ANCHORS.apex : undefined}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <meshStandardMaterial
          ref={material}
          color={landmark ? '#8de1d3' : def.color}
          roughness={0.78}
          metalness={0}
          transparent
          opacity={targetOpacity}
          depthWrite={targetOpacity >= 0.85}
          side={THREE.DoubleSide}
          polygonOffset={def.id === 'septum'}
          polygonOffsetFactor={-1}
        />
      </mesh>
      {selected && !landmark && <SourceSelectionOutline geometry={geometry} />}
    </group>
  )
}
