import { useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type {
  InstantaneousElectricalField,
  MeanElectricalAxis,
  VectorContribution,
} from '../../vector-engine'
import {
  electricalToScene,
  vectorMagnitude,
} from '../../vector-engine'

const CONTRIB_COLOR: Record<string, string> = {
  atrial_depol: '#7dffb0',
  septal_depol: '#a78bfa',
  apical_depol: '#fbbf24',
  basal_depol: '#60a5fa',
  ventricular_repol: '#f472b6',
  injury_current: '#ef4444',
  fibrillatory: '#94a3b8',
  u_wave: '#c4b5fd',
  global_st: '#fb923c',
  custom: '#e2e8f0',
}

const CONTRIB_LABEL: Record<string, string> = {
  atrial_depol: 'Atrial',
  septal_depol: 'Septal',
  apical_depol: 'Apical',
  basal_depol: 'Basal',
  ventricular_repol: 'Repol',
}

interface ArrowProps {
  direction: { x: number; y: number; z: number }
  length: number
  color: string
  opacity?: number
  origin?: [number, number, number]
  radius?: number
}

/** Procedural 3D arrow (shaft + cone) along a unit direction in scene space. */
function VectorArrow({
  direction,
  length,
  color,
  opacity = 0.95,
  origin = [0, -0.35, 0],
  radius = 0.035,
}: ArrowProps) {
  const group = useRef<THREE.Group>(null)
  const dir = useMemo(() => {
    const v = new THREE.Vector3(direction.x, direction.y, direction.z)
    if (v.lengthSq() < 1e-10) v.set(1, 0, 0)
    return v.normalize()
  }, [direction.x, direction.y, direction.z])

  const quat = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    return q
  }, [dir])

  const shaftLen = Math.max(0.05, length * 0.72)
  const headLen = Math.max(0.06, length * 0.28)

  return (
    <group ref={group} position={origin} quaternion={quat}>
      <mesh position={[0, shaftLen / 2, 0]} castShadow={false}>
        <cylinderGeometry args={[radius, radius * 0.85, shaftLen, 10]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.55}
          transparent
          opacity={opacity}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
      <mesh position={[0, shaftLen + headLen * 0.45, 0]}>
        <coneGeometry args={[radius * 2.4, headLen, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          transparent
          opacity={opacity}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
    </group>
  )
}

interface ElectricalVectorArrowsProps {
  field: InstantaneousElectricalField
  axis: MeanElectricalAxis
  activationIntensity: number
  showContributions?: boolean
}

/**
 * Teaching overlay: myocardial contribution arrows, net field direction,
 * ventricular depolarization, and mean electrical axis (frontal).
 */
export default function ElectricalVectorArrows({
  field,
  axis,
  activationIntensity,
  showContributions = true,
}: ElectricalVectorArrowsProps) {
  const pulse = useRef(0)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((_, dt) => {
    pulse.current += dt
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      const s = 0.55 + activationIntensity * 0.9
      const breathe = 1 + 0.08 * Math.sin(pulse.current * 3.2)
      glowRef.current.scale.setScalar(s * breathe)
      mat.emissiveIntensity = 0.25 + activationIntensity * 1.4
      mat.opacity = 0.12 + activationIntensity * 0.35
    }
  })

  const netScene = electricalToScene(field.dipole)
  const netMag = vectorMagnitude(field.dipole)
  const netLen = 0.35 + Math.min(1.8, netMag * 1.1)

  const qrsDir = axis.ventricularDepolarization
  const qrsLen = 0.4 + Math.min(1.6, axis.qrsMagnitude * 1.05)

  const meaAngleRad = (axis.qrsDeg * Math.PI) / 180
  // Frontal MEA in scene: +x left, +y superior ⇒ negate inferior component.
  const meaDir = {
    x: Math.cos(meaAngleRad),
    y: -Math.sin(meaAngleRad),
    z: 0,
  }

  const activeContribs = field.contributions.filter(
    (c) =>
      c.weight > 0.08 &&
      (c.kind === 'atrial_depol' ||
        c.kind === 'septal_depol' ||
        c.kind === 'apical_depol' ||
        c.kind === 'basal_depol' ||
        c.kind === 'ventricular_repol'),
  )

  return (
    <group>
      {/* Activation intensity — glowing myocardium core */}
      <mesh ref={glowRef} position={[0.05, -0.4, 0.05]}>
        <sphereGeometry args={[0.55, 24, 20]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.4}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Mean electrical axis (frontal plane) */}
      <VectorArrow
        direction={meaDir}
        length={1.55 + axis.qrsMagnitude * 0.35}
        color="#f8fafc"
        opacity={0.55 + Math.min(0.4, axis.qrsMagnitude)}
        radius={0.028}
        origin={[0, -0.35, -0.02]}
      />

      {/* Ventricular depolarization direction (3D QRS vector) */}
      <VectorArrow
        direction={qrsDir}
        length={qrsLen}
        color="#fbbf24"
        opacity={0.5 + Math.min(0.45, axis.qrsMagnitude)}
        radius={0.042}
      />

      {/* Instantaneous net field direction */}
      {netMag > 0.04 && (
        <VectorArrow
          direction={normalizeOrFallback(netScene)}
          length={netLen}
          color="#38bdf8"
          opacity={0.45 + Math.min(0.5, activationIntensity)}
          radius={0.032}
          origin={[0.02, -0.32, 0.04]}
        />
      )}

      {/* Myocardial activation contribution arrows */}
      {showContributions &&
        activeContribs.map((c, i) => (
          <ContributionArrow key={`${c.kind}-${i}`} contribution={c} index={i} />
        ))}

      <Html position={[0, 1.15, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="vector-float-label">Mean electrical axis</div>
      </Html>
      <Html position={[1.1, 0.15, 0.3]} style={{ pointerEvents: 'none' }}>
        <div className="vector-float-label vector-float-label--qrs">
          Ventricular depol.
        </div>
      </Html>
    </group>
  )
}

function ContributionArrow({
  contribution,
  index,
}: {
  contribution: VectorContribution
  index: number
}) {
  const scene = electricalToScene(contribution.vector)
  const mag = vectorMagnitude(contribution.vector)
  const len = 0.25 + Math.min(1.2, mag * 1.35)
  const color = CONTRIB_COLOR[contribution.kind] ?? '#e2e8f0'
  const label = CONTRIB_LABEL[contribution.kind]

  // Slight origin stagger so overlapping arrows remain readable.
  const ox = (index % 3) * 0.04 - 0.04
  const oy = -0.38 + (index % 2) * 0.03
  const oz = Math.floor(index / 3) * 0.05

  return (
    <group>
      <VectorArrow
        direction={normalizeOrFallback(scene)}
        length={len}
        color={color}
        opacity={0.35 + contribution.weight * 0.6}
        radius={0.022}
        origin={[ox, oy, oz]}
      />
      {label && contribution.weight > 0.25 && (
        <Html
          position={[
            ox + normalizeOrFallback(scene).x * len * 0.85,
            oy + normalizeOrFallback(scene).y * len * 0.85,
            oz + normalizeOrFallback(scene).z * len * 0.85,
          ]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="vector-contrib-tag"
            style={{ borderColor: color, color }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

function normalizeOrFallback(v: { x: number; y: number; z: number }) {
  const m = Math.hypot(v.x, v.y, v.z)
  if (m < 1e-8) return { x: 1, y: 0, z: 0 }
  return { x: v.x / m, y: v.y / m, z: v.z / m }
}
