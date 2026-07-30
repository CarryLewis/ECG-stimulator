import { Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { HeartStructureDef } from '../../anatomy/types'

/** Shared sphere — one geometry for all chamber pieces (performance). */
const SHARED_SPHERE = new THREE.SphereGeometry(1, 32, 24)

interface HeartStructureMeshProps {
  def: HeartStructureDef
  selected: boolean
  dimmed: boolean
  myocardiumOpacity: number
  showLabel: boolean
  onSelect: (id: HeartStructureDef['id']) => void
}

export default function HeartStructureMesh({
  def,
  selected,
  dimmed,
  myocardiumOpacity,
  showLabel,
  onSelect,
}: HeartStructureMeshProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  const opacity = useMemo(() => {
    const base = Math.max(
      0.12,
      Math.min(1, myocardiumOpacity + (def.opacityBias ?? 0)),
    )
    if (selected) return Math.min(1, base + 0.18)
    if (dimmed) return Math.max(0.08, base * 0.35)
    return base
  }, [def.opacityBias, dimmed, myocardiumOpacity, selected])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect(def.id)
  }

  const labelPos: [number, number, number] = [
    def.position[0] + def.labelOffset[0],
    def.position[1] + def.labelOffset[1],
    def.position[2] + def.labelOffset[2],
  ]

  return (
    <group>
      <mesh
        geometry={SHARED_SPHERE}
        position={def.position}
        scale={def.scale.map((s) => s * def.radius) as [number, number, number]}
        rotation={def.rotation}
        renderOrder={def.renderOrder}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <meshStandardMaterial
          ref={matRef}
          color={def.color}
          emissive={def.emissive}
          emissiveIntensity={selected ? 0.55 : dimmed ? 0.08 : 0.22}
          roughness={0.42}
          metalness={0.06}
          transparent
          opacity={opacity}
          depthWrite={opacity > 0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {showLabel && (
        <Html
          position={labelPos}
          center
          distanceFactor={8}
          zIndexRange={[30, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <button
            type="button"
            className={
              'anatomy-label' +
              (selected ? ' anatomy-label--selected' : '') +
              (dimmed ? ' anatomy-label--dimmed' : '')
            }
            style={{
              ['--label-color' as string]: def.emissive,
              pointerEvents: 'auto',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(def.id)
            }}
          >
            <span className="anatomy-label-abbr">{def.abbr}</span>
            <span className="anatomy-label-name">{def.label.en}</span>
          </button>
        </Html>
      )}
    </group>
  )
}
