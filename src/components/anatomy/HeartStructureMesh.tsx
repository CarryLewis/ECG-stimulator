import { Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { HeartStructureDef } from '../../anatomy/types'

interface HeartStructureMeshProps {
  def: HeartStructureDef
  selected: boolean
  dimmed: boolean
  myocardiumOpacity: number
  showLabel: boolean
  /** 0–1 activation from the EP event engine (optional). */
  activation?: number
  onSelect: (id: HeartStructureDef['id']) => void
}

/**
 * One chamber / wall piece.
 * Geometry is per-mesh (JSX) so StrictMode / Canvas remounts cannot dispose a
 * shared SphereGeometry out from under the scene.
 */
export default function HeartStructureMesh({
  def,
  selected,
  dimmed,
  myocardiumOpacity,
  showLabel,
  activation = 0,
  onSelect,
}: HeartStructureMeshProps) {
  const opacity = useMemo(() => {
    const base = Math.max(
      0.45,
      Math.min(1, myocardiumOpacity + (def.opacityBias ?? 0)),
    )
    if (selected) return Math.min(1, Math.max(base, 0.92))
    if (dimmed) return Math.max(0.28, base * 0.5)
    return base
  }, [def.opacityBias, dimmed, myocardiumOpacity, selected])

  const useTransparency = opacity < 0.98

  const emissiveIntensity = useMemo(() => {
    const pulse = 0.35 + activation * 0.95
    if (selected) return Math.max(0.7, pulse)
    if (dimmed) return 0.12 + activation * 0.2
    return pulse
  }, [activation, dimmed, selected])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect(def.id)
  }

  const labelPos: [number, number, number] = [
    def.position[0] + def.labelOffset[0],
    def.position[1] + def.labelOffset[1],
    def.position[2] + def.labelOffset[2],
  ]

  const meshScale = useMemo(
    (): [number, number, number] => [
      def.scale[0] * def.radius,
      def.scale[1] * def.radius,
      def.scale[2] * def.radius,
    ],
    [def.radius, def.scale],
  )

  return (
    <group>
      <mesh
        position={def.position}
        scale={meshScale}
        rotation={def.rotation}
        renderOrder={def.renderOrder}
        frustumCulled={false}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[1, 28, 20]} />
        <meshStandardMaterial
          color={def.color}
          emissive={def.emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.45}
          metalness={0.05}
          transparent={useTransparency}
          opacity={opacity}
          depthWrite={!useTransparency}
          side={THREE.FrontSide}
        />
      </mesh>

      {showLabel && (
        <Html
          position={labelPos}
          center
          distanceFactor={10}
          zIndexRange={[12, 2]}
          style={{ pointerEvents: 'none' }}
        >
          <button
            type="button"
            className={
              'anatomy-label' +
              (selected ? ' anatomy-label--selected' : '') +
              (dimmed ? ' anatomy-label--dimmed' : '') +
              (activation > 0.35 ? ' anatomy-label--live' : '')
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
