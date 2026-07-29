import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { ConductionState } from '../../ecg/types'

const IDLE: [number, number, number] = [0.14, 0.2, 0.3]
const ACTIVE: [number, number, number] = [0.2, 0.95, 0.55]
const BLOCK: [number, number, number] = [0.97, 0.44, 0.44]
const MYO_BASE: [number, number, number] = [0.55, 0.18, 0.22]

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  const c = Math.max(0, Math.min(1, t))
  return [
    a[0] + (b[0] - a[0]) * c,
    a[1] + (b[1] - a[1]) * c,
    a[2] + (b[2] - a[2]) * c,
  ]
}

function myoColor(activation: number): [number, number, number] {
  return mixRgb(MYO_BASE, ACTIVE, activation * 0.85)
}

function nodeColor(activation: number, blocked = false): [number, number, number] {
  if (blocked) return BLOCK
  return mixRgb(IDLE, ACTIVE, activation)
}

function TubePath({
  curve,
  color,
  radius,
  intensity,
}: {
  curve: THREE.CatmullRomCurve3
  color: [number, number, number]
  radius: number
  intensity: number
}) {
  const geom = useMemo(
    () => new THREE.TubeGeometry(curve, 48, radius, 10, false),
    [curve, radius],
  )
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color={new THREE.Color(...color)}
        emissive={new THREE.Color(...color)}
        emissiveIntensity={0.25 + intensity * 1.6}
        roughness={0.35}
      />
    </mesh>
  )
}

/** Version 1 — schematic chambers + glowing conduction tree. */
export default function HeartConductionV1({ state }: { state: ConductionState }) {
  const paths = useMemo(() => {
    const his = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.35, 0.05),
      new THREE.Vector3(0.02, 0.05, 0.08),
      new THREE.Vector3(0.0, -0.25, 0.1),
    ])
    const leftBundle = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, -0.25, 0.1),
      new THREE.Vector3(-0.35, -0.55, 0.15),
      new THREE.Vector3(-0.55, -0.95, 0.2),
      new THREE.Vector3(-0.45, -1.25, 0.25),
    ])
    const rightBundle = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, -0.25, 0.1),
      new THREE.Vector3(0.4, -0.5, 0.12),
      new THREE.Vector3(0.65, -0.9, 0.18),
      new THREE.Vector3(0.55, -1.2, 0.22),
    ])
    const purkinjeL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.45, -1.25, 0.25),
      new THREE.Vector3(-0.7, -1.35, 0.05),
      new THREE.Vector3(-0.35, -1.45, -0.15),
    ])
    const purkinjeR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55, -1.2, 0.22),
      new THREE.Vector3(0.8, -1.3, 0.0),
      new THREE.Vector3(0.4, -1.4, -0.18),
    ])
    return { his, leftBundle, rightBundle, purkinjeL, purkinjeR }
  }, [])

  const saPos: [number, number, number] = [0.15, 1.05, 0.35]
  const avPos: [number, number, number] = [0.05, 0.35, 0.05]

  const atriaCol = myoColor(state.atria)
  const ventCol = myoColor(state.ventricle)
  const saCol = nodeColor(state.sa)
  const avCol = nodeColor(state.av, !state.avConducts)
  const hisCol = nodeColor(state.his)
  const bundleCol = nodeColor(state.bundle)
  const ventPathCol = nodeColor(state.ventricle)

  return (
    <group rotation={[0.15, -0.35, 0]} position={[0, 0.15, 0]}>
      <mesh position={[-0.55, 0.85, 0.1]} castShadow>
        <sphereGeometry args={[0.48, 32, 24]} />
        <meshStandardMaterial
          color={new THREE.Color(...atriaCol)}
          roughness={0.45}
          metalness={0.1}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh position={[0.55, 0.9, 0.05]} castShadow>
        <sphereGeometry args={[0.46, 32, 24]} />
        <meshStandardMaterial
          color={new THREE.Color(...atriaCol)}
          roughness={0.45}
          metalness={0.1}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh position={[-0.45, -0.55, 0.05]} scale={[0.95, 1.35, 0.9]} castShadow>
        <sphereGeometry args={[0.72, 36, 28]} />
        <meshStandardMaterial
          color={new THREE.Color(...ventCol)}
          roughness={0.4}
          metalness={0.12}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[0.4, -0.5, 0.0]} scale={[1.05, 1.45, 1.0]} castShadow>
        <sphereGeometry args={[0.78, 36, 28]} />
        <meshStandardMaterial
          color={new THREE.Color(...ventCol)}
          roughness={0.4}
          metalness={0.12}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[0.05, -1.45, 0.05]} scale={[0.7, 0.55, 0.65]}>
        <sphereGeometry args={[0.55, 24, 16]} />
        <meshStandardMaterial
          color={new THREE.Color(...ventCol)}
          roughness={0.45}
          transparent
          opacity={0.82}
        />
      </mesh>

      <mesh position={saPos}>
        <sphereGeometry args={[0.1, 20, 16]} />
        <meshStandardMaterial
          color={new THREE.Color(...saCol)}
          emissive={new THREE.Color(...saCol)}
          emissiveIntensity={0.4 + state.sa * 1.8}
        />
      </mesh>
      <Html position={[saPos[0] + 0.25, saPos[1] + 0.12, saPos[2]]} center>
        <span className="conduction-3d-label">SA</span>
      </Html>

      <mesh position={avPos}>
        <sphereGeometry args={[0.11, 20, 16]} />
        <meshStandardMaterial
          color={new THREE.Color(...avCol)}
          emissive={new THREE.Color(...avCol)}
          emissiveIntensity={state.avConducts ? 0.35 + state.av * 1.8 : 0.9}
        />
      </mesh>
      <Html position={[avPos[0] + 0.28, avPos[1], avPos[2]]} center>
        <span className="conduction-3d-label">AV</span>
      </Html>

      {!state.avConducts && (
        <Html position={[avPos[0], avPos[1] - 0.25, avPos[2]]} center>
          <span className="conduction-3d-label conduction-3d-label--block">
            BLOCK
          </span>
        </Html>
      )}

      <TubePath curve={paths.his} color={hisCol} radius={0.045} intensity={state.his} />
      <TubePath
        curve={paths.leftBundle}
        color={bundleCol}
        radius={0.035}
        intensity={state.bundle}
      />
      <TubePath
        curve={paths.rightBundle}
        color={bundleCol}
        radius={0.035}
        intensity={state.bundle}
      />
      <TubePath
        curve={paths.purkinjeL}
        color={ventPathCol}
        radius={0.022}
        intensity={state.ventricle}
      />
      <TubePath
        curve={paths.purkinjeR}
        color={ventPathCol}
        radius={0.022}
        intensity={state.ventricle}
      />

      <Html position={[-0.95, 0.95, 0]} center>
        <span className="conduction-3d-label conduction-3d-label--dim">RA</span>
      </Html>
      <Html position={[0.95, 1.0, 0]} center>
        <span className="conduction-3d-label conduction-3d-label--dim">LA</span>
      </Html>
      <Html position={[-0.95, -0.7, 0]} center>
        <span className="conduction-3d-label conduction-3d-label--dim">RV</span>
      </Html>
      <Html position={[1.0, -0.65, 0]} center>
        <span className="conduction-3d-label conduction-3d-label--dim">LV</span>
      </Html>
    </group>
  )
}
