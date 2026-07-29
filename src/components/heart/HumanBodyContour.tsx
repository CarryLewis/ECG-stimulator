import { useMemo } from 'react'
import { DoubleSide, Vector2 } from 'three'

/**
 * Clear, proportionally scaled adult-male body contour for V3 ECG placement.
 *
 * Anthropometry (scene units chosen so shoulder breadth matches electrode
 * RA/LA at x ≈ ±1.05):
 *   biacromial (shoulder) ≈ 2.10
 *   head / neck / chest / waist / hip follow typical male ratios
 *   A–P depth flattened (~0.58×) so the silhouette reads clearly
 *
 * Axes: +x patient left, +y superior, +z anterior.
 */

/** Half-profile [x radius, y] — lathed around +Y for the body outline. */
const TORSO_PROFILE: [number, number][] = [
  [0.02, 1.72], // crown
  [0.26, 1.68],
  [0.3, 1.55], // parietal
  [0.28, 1.4], // temple / cheek
  [0.22, 1.32], // jaw taper
  [0.17, 1.26], // neck narrow
  [0.2, 1.2],
  [0.42, 1.14], // trapezius flare
  [0.95, 1.1], // lateral neck → shoulder
  [1.08, 1.05], // acromion (matches RA/LA height)
  [1.1, 0.98],
  [1.02, 0.85], // deltoid falloff
  [0.96, 0.65], // upper thorax
  [0.94, 0.4], // mid thorax (V-lead band)
  [0.9, 0.15],
  [0.86, -0.1], // lower thorax
  [0.8, -0.35],
  [0.74, -0.55], // costal margin
  [0.7, -0.75], // epigastrium
  [0.68, -0.95], // waist
  [0.72, -1.15], // iliac crest rise
  [0.82, -1.35], // hip
  [0.88, -1.55], // greater trochanter cue
  [0.78, -1.75], // upper thigh
  [0.7, -1.9],
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
      <mesh scale={[1, 1, 0.58]} position={[0, 0, -0.05]}>
        <latheGeometry args={[points, 64]} />
        <meshStandardMaterial
          color={SKIN}
          emissive={SKIN_EMIT}
          emissiveIntensity={0.35}
          transparent
          opacity={0.5}
          roughness={0.85}
          metalness={0.04}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      {/* Brighter outer rim so the outline pops on dark backgrounds */}
      <mesh scale={[1.045, 1.015, 0.64]} position={[0, 0, -0.05]}>
        <latheGeometry args={[points, 48]} />
        <meshStandardMaterial
          color={EDGE}
          emissive="#6b84a4"
          emissiveIntensity={0.5}
          transparent
          opacity={0.22}
          roughness={1}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      <UpperArms />

      {/* Soft anterior chest plate so V-leads sit on a surface */}
      <mesh position={[0, 0.15, 0.42]} scale={[0.92, 1.05, 0.22]}>
        <sphereGeometry args={[0.95, 36, 24]} />
        <meshStandardMaterial
          color="#a8bdd4"
          emissive="#4a6582"
          emissiveIntensity={0.25}
          transparent
          opacity={0.2}
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
        position={[-1.15, 0.55, 0.05]}
        rotation={[0.15, 0, 0.35]}
        scale={[0.9, 1, 0.85]}
      >
        <capsuleGeometry args={[0.16, 0.85, 6, 12]} />
        <meshStandardMaterial
          color={SKIN}
          emissive={SKIN_EMIT}
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
          roughness={0.85}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <mesh
        position={[1.15, 0.55, 0.05]}
        rotation={[0.15, 0, -0.35]}
        scale={[0.9, 1, 0.85]}
      >
        <capsuleGeometry args={[0.16, 0.85, 6, 12]} />
        <meshStandardMaterial
          color={SKIN}
          emissive={SKIN_EMIT}
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
          roughness={0.85}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}
