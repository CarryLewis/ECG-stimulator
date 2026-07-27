import { Html } from '@react-three/drei'
import { useLanguage } from '../../i18n/useLanguage'

/**
 * Educational rib cage for V3 — sternum, clavicles, ribs 1–7, and
 * highlighted 4th / 5th intercostal spaces (V1–V2 / V4 landmarks).
 *
 * Body axes match electrodeMap: +x patient left, +y superior, +z anterior.
 */

/** Approximate superior→inferior Y of costal cartilage / anterior rib arcs. */
const RIB_ROWS: { n: number; y: number; radius: number; z: number }[] = [
  { n: 1, y: 1.02, radius: 0.52, z: 0.42 },
  { n: 2, y: 0.78, radius: 0.68, z: 0.5 },
  { n: 3, y: 0.52, radius: 0.82, z: 0.56 },
  { n: 4, y: 0.28, radius: 0.92, z: 0.6 },
  { n: 5, y: 0.02, radius: 0.98, z: 0.58 },
  { n: 6, y: -0.24, radius: 0.95, z: 0.52 },
  { n: 7, y: -0.48, radius: 0.88, z: 0.45 },
]

/** Intercostal space midpoints used for ECG teaching callouts. */
const ICS_MARKERS: {
  id: string
  y: number
  z: number
  labelZh: string
  labelEn: string
  noteZh: string
  noteEn: string
}[] = [
  {
    id: 'ics4',
    y: 0.15,
    z: 0.78,
    labelZh: '第 4 肋间',
    labelEn: '4th ICS',
    noteZh: 'V1 / V2 安放水平',
    noteEn: 'V1 / V2 level',
  },
  {
    id: 'ics5',
    y: -0.11,
    z: 0.76,
    labelZh: '第 5 肋间',
    labelEn: '5th ICS',
    noteZh: 'V4–V6 安放水平',
    noteEn: 'V4–V6 level',
  },
]

const BONE = '#c5d0dc'
const BONE_EMISSIVE = '#6b7c8f'
const ICS_GLOW = '#38bdf8'

export default function Ribcage({ showLabels = true }: { showLabels?: boolean }) {
  return (
    <group>
      <Sternum />
      <Clavicles />
      {RIB_ROWS.map((rib) => (
        <RibArc key={rib.n} {...rib} highlight={rib.n === 4 || rib.n === 5} />
      ))}
      {/* Costal margin cue */}
      <mesh position={[0, -0.72, 0.28]} rotation={[0.55, 0, 0]}>
        <torusGeometry args={[0.72, 0.018, 6, 28, Math.PI * 0.7]} />
        <meshStandardMaterial
          color={BONE}
          emissive={BONE_EMISSIVE}
          emissiveIntensity={0.15}
          transparent
          opacity={0.55}
          roughness={0.65}
          depthWrite={false}
        />
      </mesh>
      {showLabels &&
        ICS_MARKERS.map((m) => <IcsMarker key={m.id} {...m} />)}
    </group>
  )
}

function Sternum() {
  return (
    <group>
      {/* Manubrium */}
      <mesh position={[0, 1.05, 0.62]} scale={[0.55, 0.35, 0.2]}>
        <boxGeometry args={[0.28, 0.28, 0.08]} />
        <meshStandardMaterial
          color={BONE}
          emissive={BONE_EMISSIVE}
          emissiveIntensity={0.22}
          transparent
          opacity={0.78}
          roughness={0.55}
        />
      </mesh>
      {/* Sternal body */}
      <mesh position={[0, 0.45, 0.64]} scale={[0.42, 1, 0.18]}>
        <boxGeometry args={[0.22, 1.05, 0.07]} />
        <meshStandardMaterial
          color={BONE}
          emissive={BONE_EMISSIVE}
          emissiveIntensity={0.2}
          transparent
          opacity={0.75}
          roughness={0.55}
        />
      </mesh>
      {/* Xiphoid */}
      <mesh position={[0, -0.18, 0.6]} scale={[0.3, 0.35, 0.15]}>
        <boxGeometry args={[0.12, 0.22, 0.05]} />
        <meshStandardMaterial
          color={BONE}
          emissive={BONE_EMISSIVE}
          emissiveIntensity={0.18}
          transparent
          opacity={0.7}
          roughness={0.6}
        />
      </mesh>
      {/* Sternal angle notch cue (2nd rib attachment) */}
      <mesh position={[0, 0.88, 0.68]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial
          color="#e2e8f0"
          emissive="#94a3b8"
          emissiveIntensity={0.35}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  )
}

function Clavicles() {
  return (
    <group>
      <mesh position={[-0.55, 1.18, 0.45]} rotation={[0.15, 0.35, 0.08]}>
        <capsuleGeometry args={[0.035, 0.85, 4, 8]} />
        <meshStandardMaterial
          color={BONE}
          emissive={BONE_EMISSIVE}
          emissiveIntensity={0.18}
          transparent
          opacity={0.72}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[0.55, 1.18, 0.45]} rotation={[0.15, -0.35, -0.08]}>
        <capsuleGeometry args={[0.035, 0.85, 4, 8]} />
        <meshStandardMaterial
          color={BONE}
          emissive={BONE_EMISSIVE}
          emissiveIntensity={0.18}
          transparent
          opacity={0.72}
          roughness={0.55}
        />
      </mesh>
    </group>
  )
}

function RibArc({
  n,
  y,
  radius,
  z,
  highlight,
}: {
  n: number
  y: number
  radius: number
  z: number
  highlight?: boolean
}) {
  const color = highlight ? '#9ec5e8' : BONE
  const emissive = highlight ? ICS_GLOW : BONE_EMISSIVE
  const intensity = highlight ? 0.35 : 0.16
  // Anterior half-ring; slight pitch so lower ribs tip inferiorly.
  const pitch = 0.08 + (n - 1) * 0.04

  return (
    <group position={[0, y, z]} rotation={[Math.PI / 2 + pitch, 0, 0]}>
      <mesh>
        <torusGeometry args={[radius, highlight ? 0.028 : 0.022, 6, 40, Math.PI]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={intensity}
          transparent
          opacity={highlight ? 0.85 : 0.62}
          roughness={0.55}
          depthWrite={false}
        />
      </mesh>
      {/* Tiny rib number on the right parasternal side */}
      <Html
        position={[-radius * 0.15, 0.02, radius * 0.55]}
        center
        style={{ pointerEvents: 'none' }}
        zIndexRange={[15, 0]}
      >
        <span className="rib-number">{n}</span>
      </Html>
    </group>
  )
}

function IcsMarker({
  y,
  z,
  labelZh,
  labelEn,
  noteZh,
  noteEn,
}: {
  y: number
  z: number
  labelZh: string
  labelEn: string
  noteZh: string
  noteEn: string
}) {
  const { locale } = useLanguage()
  const label = locale === 'zh' ? labelZh : labelEn
  const note = locale === 'zh' ? noteZh : noteEn

  return (
    <group position={[0.42, y, z]}>
      <mesh>
        <sphereGeometry args={[0.03, 10, 8]} />
        <meshStandardMaterial
          color={ICS_GLOW}
          emissive={ICS_GLOW}
          emissiveIntensity={0.8}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Horizontal ICS guide across the sternum */}
      <mesh position={[-0.42, 0, -0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.95, 6]} />
        <meshStandardMaterial
          color={ICS_GLOW}
          emissive={ICS_GLOW}
          emissiveIntensity={0.45}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
      <Html position={[0.28, 0.02, 0.05]} style={{ pointerEvents: 'none' }} zIndexRange={[18, 0]}>
        <div className="ics-tag">
          <strong>{label}</strong>
          <span>{note}</span>
        </div>
      </Html>
    </group>
  )
}
