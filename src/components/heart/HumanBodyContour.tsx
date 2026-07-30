import { useMemo } from 'react'
import { DoubleSide, Vector2 } from 'three'

/**
 * Adult-male body contour for V3 ECG placement.
 *
 * Anthropometry (scene units): shoulder breadth ≈ 2.4 so the mediastinal
 * heart (~0.5 scale) sits at a believable ~1/4–1/3 of chest width.
 * Head / neck / thorax / waist / hip follow typical male ratios.
 * A–P depth flattened (~0.62×) so the silhouette stays readable.
 *
 * Axes: +x patient left, +y superior, +z anterior.
 */

/** Uniform body scale for silhouette + electrodes/guides/labels in V3. */
export const BODY_SCALE = 1.28

/**
 * Half-profile [x radius, y] — lathed around +Y.
 * Tuned so the thorax reads taller than it is wide at the waist, with a
 * clear neck and modest hip flare (not a blob around the heart).
 */
const TORSO_PROFILE: [number, number][] = [
  [0.02, 1.78], // crown
  [0.24, 1.74],
  [0.28, 1.6], // parietal
  [0.26, 1.45], // temple
  [0.2, 1.36], // jaw
  [0.15, 1.28], // neck narrow
  [0.18, 1.22],
  [0.38, 1.16], // trapezius
  [0.88, 1.12], // lateral neck → shoulder
  [1.05, 1.06], // acromion
  [1.08, 0.98],
  [1.0, 0.82], // deltoid falloff
  [0.94, 0.58], // upper thorax
  [0.92, 0.32], // mid thorax (V-lead band)
  [0.88, 0.08],
  [0.84, -0.18], // lower thorax
  [0.78, -0.42],
  [0.72, -0.62], // costal margin
  [0.68, -0.82], // epigastrium
  [0.66, -1.02], // waist (narrower than chest)
  [0.7, -1.22], // iliac crest
  [0.8, -1.42], // hip
  [0.86, -1.62], // trochanter cue
  [0.76, -1.82], // upper thigh
  [0.68, -1.98],
]

const SKIN = '#9aadc4'
const SKIN_EMIT = '#3a4f6a'
const EDGE = '#d7e4f5'

export default function HumanBodyContour() {
  const points = useMemo(
    () => TORSO_PROFILE.map(([x, y]) => new Vector2(x, y)),
    [],
  )

  return (
    <group>
      {/* Main lathed silhouette — flattened A–P for a readable contour */}
      <mesh scale={[1, 1, 0.62]} position={[0, 0, -0.04]}>
        <latheGeometry args={[points, 64]} />
        <meshStandardMaterial
          color={SKIN}
          emissive={SKIN_EMIT}
          emissiveIntensity={0.32}
          transparent
          opacity={0.34}
          roughness={0.85}
          metalness={0.04}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      {/* Brighter outer rim so the outline pops on dark backgrounds */}
      <mesh scale={[1.04, 1.012, 0.68]} position={[0, 0, -0.04]}>
        <latheGeometry args={[points, 48]} />
        <meshStandardMaterial
          color={EDGE}
          emissive="#6b84a4"
          emissiveIntensity={0.4}
          transparent
          opacity={0.16}
          roughness={1}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      <UpperArms />

      {/* Soft anterior chest plate so V-leads sit on a surface */}
      <mesh position={[0, 0.18, 0.4]} scale={[0.9, 1.0, 0.2]}>
        <sphereGeometry args={[0.95, 36, 24]} />
        <meshStandardMaterial
          color="#a8bdd4"
          emissive="#4a6582"
          emissiveIntensity={0.22}
          transparent
          opacity={0.18}
          roughness={0.9}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}

/** Upper-arm stubs so RA/LA sit on a believable shoulder–arm contour. */
function UpperArms() {
  return (
    <group>
      <mesh
        position={[-1.12, 0.52, 0.04]}
        rotation={[0.12, 0, 0.32]}
        scale={[0.95, 1.05, 0.88]}
      >
        <capsuleGeometry args={[0.17, 0.92, 6, 12]} />
        <meshStandardMaterial
          color={SKIN}
          emissive={SKIN_EMIT}
          emissiveIntensity={0.28}
          transparent
          opacity={0.48}
          roughness={0.85}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <mesh
        position={[1.12, 0.52, 0.04]}
        rotation={[0.12, 0, -0.32]}
        scale={[0.95, 1.05, 0.88]}
      >
        <capsuleGeometry args={[0.17, 0.92, 6, 12]} />
        <meshStandardMaterial
          color={SKIN}
          emissive={SKIN_EMIT}
          emissiveIntensity={0.28}
          transparent
          opacity={0.48}
          roughness={0.85}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}
