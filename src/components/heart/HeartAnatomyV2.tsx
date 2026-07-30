import { Html, Line } from '@react-three/drei'
import type { LeadLandmark } from '../../ecg/leadMap'
import {
  LEAD_LANDMARKS,
  TERRITORY_COLOR,
  WALL_PATCHES,
} from '../../ecg/leadMap'
import type { ConductionState, LeadName, Territory } from '../../ecg/types'
import { useLanguage } from '../../i18n/useLanguage'

export type AnatomyLayer = 'walls' | 'pins'

interface HeartAnatomyV2Props {
  state: ConductionState
  selectedLead: LeadName | null
  onSelectLead: (lead: LeadName | null) => void
  layers: Record<AnatomyLayer, boolean>
}

function activationBoost(state: ConductionState, territory: Territory): number {
  if (territory === 'none') return state.atria * 0.35
  // Mild pulse so wall colour still reads while conduction runs.
  return 0.55 + state.ventricle * 0.45
}

/** Version 2 — anatomical walls + 12-lead detection pins (atlas style). */
export default function HeartAnatomyV2({
  state,
  selectedLead,
  onSelectLead,
  layers,
}: HeartAnatomyV2Props) {
  const selected = selectedLead
    ? LEAD_LANDMARKS.find((l) => l.lead === selectedLead)
    : null

  return (
    <group rotation={[0.12, -0.4, 0]} position={[0, 0.1, 0]}>
      {/* Soft torso silhouette for spatial context */}
      <mesh position={[0, -0.2, -0.85]} scale={[1.6, 2.2, 0.55]}>
        <sphereGeometry args={[1.1, 28, 20]} />
        <meshStandardMaterial
          color="#e8eef5"
          transparent
          opacity={0.14}
          depthWrite={false}
        />
      </mesh>

      {/* Base myocardium — bright so wall structure reads clearly */}
      <mesh position={[-0.5, 0.85, 0.05]} castShadow>
        <sphereGeometry args={[0.5, 36, 28]} />
        <meshStandardMaterial
          color="#c85864"
          roughness={0.4}
          metalness={0.06}
          emissive="#a03040"
          emissiveIntensity={0.35 + state.atria * 0.35}
        />
      </mesh>
      <mesh position={[0.52, 0.9, 0.0]} castShadow>
        <sphereGeometry args={[0.48, 36, 28]} />
        <meshStandardMaterial
          color="#c85864"
          roughness={0.4}
          metalness={0.06}
          emissive="#a03040"
          emissiveIntensity={0.35 + state.atria * 0.35}
        />
      </mesh>
      <mesh position={[-0.42, -0.5, 0.05]} scale={[0.95, 1.35, 0.95]} castShadow>
        <sphereGeometry args={[0.75, 40, 32]} />
        <meshStandardMaterial
          color="#d0606c"
          roughness={0.36}
          metalness={0.08}
          emissive="#c04050"
          emissiveIntensity={0.4 + state.ventricle * 0.4}
          transparent
          opacity={0.96}
        />
      </mesh>
      <mesh position={[0.42, -0.45, 0.0]} scale={[1.08, 1.48, 1.05]} castShadow>
        <sphereGeometry args={[0.82, 40, 32]} />
        <meshStandardMaterial
          color="#e0707c"
          roughness={0.34}
          metalness={0.08}
          emissive="#d05060"
          emissiveIntensity={0.45 + state.ventricle * 0.4}
          transparent
          opacity={0.96}
        />
      </mesh>
      <mesh position={[0.08, -1.42, 0.05]} scale={[0.75, 0.55, 0.7]}>
        <sphereGeometry args={[0.58, 28, 20]} />
        <meshStandardMaterial
          color="#d0606c"
          roughness={0.4}
          emissive="#c04050"
          emissiveIntensity={0.35 + state.ventricle * 0.3}
        />
      </mesh>

      {/* Great vessels cue */}
      <mesh position={[-0.15, 1.35, -0.05]} rotation={[0.2, 0, 0.15]}>
        <cylinderGeometry args={[0.12, 0.14, 0.55, 16]} />
        <meshStandardMaterial
          color="#ff5a5a"
          roughness={0.32}
          emissive="#ff3030"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[0.2, 1.4, -0.1]} rotation={[-0.15, 0, -0.2]}>
        <cylinderGeometry args={[0.1, 0.12, 0.5, 16]} />
        <meshStandardMaterial
          color="#5b9fdf"
          roughness={0.32}
          emissive="#3a7fc0"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Conduction nodes (subtle, still synced) */}
      <mesh position={[0.18, 1.05, 0.38]}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshStandardMaterial
          color="#3dff8a"
          emissive="#3dff8a"
          emissiveIntensity={0.3 + state.sa * 1.5}
        />
      </mesh>
      <mesh position={[0.05, 0.32, 0.08]}>
        <sphereGeometry args={[0.075, 16, 12]} />
        <meshStandardMaterial
          color={state.avConducts ? '#3dff8a' : '#f87171'}
          emissive={state.avConducts ? '#3dff8a' : '#f87171'}
          emissiveIntensity={0.35 + state.av * 1.4}
        />
      </mesh>

      {layers.walls &&
        WALL_PATCHES.map((patch) => {
          const active =
            !selected ||
            selected.territory === patch.territory ||
            (selected.territory === 'none' && patch.territory === 'septal')
          const boost = activationBoost(state, patch.territory)
          const color = TERRITORY_COLOR[patch.territory]
          return (
            <mesh
              key={patch.id}
              position={patch.position}
              scale={patch.scale}
              rotation={patch.rotation}
              onClick={(e) => {
                e.stopPropagation()
                const lead =
                  LEAD_LANDMARKS.find((l) => l.territory === patch.territory)
                    ?.lead ?? null
                onSelectLead(lead)
              }}
            >
              <sphereGeometry args={[0.55, 28, 20]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={active ? 0.25 * boost : 0.04}
                transparent
                opacity={active ? 0.78 : 0.18}
                depthWrite={false}
              />
            </mesh>
          )
        })}

      {layers.pins &&
        LEAD_LANDMARKS.map((landmark) => (
          <LeadPin
            key={landmark.lead}
            landmark={landmark}
            selected={selectedLead === landmark.lead}
            dimmed={
              selectedLead !== null &&
              selectedLead !== landmark.lead &&
              LEAD_LANDMARKS.find((l) => l.lead === selectedLead)?.territory !==
                landmark.territory
            }
            onSelect={() =>
              onSelectLead(
                selectedLead === landmark.lead ? null : landmark.lead,
              )
            }
          />
        ))}
    </group>
  )
}

function LeadPin({
  landmark,
  selected,
  dimmed,
  onSelect,
}: {
  landmark: LeadLandmark
  selected: boolean
  dimmed: boolean
  onSelect: () => void
}) {
  const { locale } = useLanguage()
  const face = locale === 'zh' ? landmark.faceZh : landmark.faceEn
  const pinPos: [number, number, number] = [
    landmark.position[0] + landmark.pinOffset[0],
    landmark.position[1] + landmark.pinOffset[1],
    landmark.position[2] + landmark.pinOffset[2],
  ]

  return (
    <group>
      <Line
        points={[landmark.position, pinPos]}
        color={landmark.color}
        lineWidth={selected ? 2.5 : 1.2}
        transparent
        opacity={dimmed ? 0.2 : selected ? 0.95 : 0.65}
      />
      <mesh position={landmark.position}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial
          color={landmark.color}
          emissive={landmark.color}
          emissiveIntensity={selected ? 1.2 : 0.35}
          transparent
          opacity={dimmed ? 0.25 : 1}
        />
      </mesh>
      <Html
        position={pinPos}
        center
        zIndexRange={[20, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <button
          type="button"
          className={
            'lead-pin' +
            (selected ? ' lead-pin--selected' : '') +
            (dimmed ? ' lead-pin--dimmed' : '')
          }
          style={{
            ['--pin-color' as string]: landmark.color,
            pointerEvents: 'auto',
          }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          title={`${landmark.lead} · ${face}`}
        >
          <span className="lead-pin-square" />
          <span className="lead-pin-name">{landmark.lead}</span>
        </button>
      </Html>
    </group>
  )
}
