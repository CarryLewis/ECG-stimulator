import { Html, Line } from '@react-three/drei'
import { DoubleSide } from 'three'
import {
  ELECTRODE_SITES,
  LEAD_ELECTRODES,
  LEAD_PLACEMENT_LABELS,
  type ElectrodeSite,
} from '../../ecg/electrodeMap'
import type { ConductionState, LeadName } from '../../ecg/types'
import { useLanguage } from '../../i18n/useLanguage'
import RealisticHeart from './RealisticHeart'
import Ribcage from './Ribcage'

export type TorsoLayer = 'torso' | 'ribs' | 'heart' | 'electrodes' | 'leads'

interface HeartTorsoV3Props {
  state: ConductionState
  selectedLead: LeadName | null
  onSelectLead: (lead: LeadName | null) => void
  layers: Record<TorsoLayer, boolean>
}

/**
 * Version 3 — clinical 12-lead placement schematic:
 * translucent male torso + mediastinal heart (Unity GLB or procedural) +
 * labelled RA/LA/RL/LL and V1–V6 electrodes with derived lead callouts.
 */
export default function HeartTorsoV3({
  state,
  selectedLead,
  onSelectLead,
  layers,
}: HeartTorsoV3Props) {
  const activeElectrodes = selectedLead ? LEAD_ELECTRODES[selectedLead] : null

  return (
    <group position={[0, 0.05, 0]}>
      {layers.torso && <TranslucentTorso />}

      {layers.ribs && <Ribcage showLabels />}

      {layers.heart && <RealisticHeart state={state} />}

      {/* Sternum / mid-clavicular guide lines for placement teaching */}
      {layers.torso && (
        <group>
          <Line
            points={[
              [0, 1.15, 0.72],
              [0, -0.55, 0.72],
            ]}
            color="#cbd5e1"
            lineWidth={1.5}
            transparent
            opacity={0.55}
            dashed
            dashSize={0.08}
            gapSize={0.05}
          />
          <Line
            points={[
              [0.55, 1.05, 0.55],
              [0.55, -0.55, 0.72],
            ]}
            color="#94a3b8"
            lineWidth={1.25}
            transparent
            opacity={0.45}
            dashed
            dashSize={0.07}
            gapSize={0.05}
          />
        </group>
      )}

      {/* Einthoven triangle edges when a limb lead is selected */}
      {selectedLead &&
        (selectedLead === 'I' ||
          selectedLead === 'II' ||
          selectedLead === 'III') && (
          <EinthovenHighlight lead={selectedLead} />
        )}

      {layers.electrodes &&
        ELECTRODE_SITES.map((site) => {
          const active =
            !activeElectrodes || activeElectrodes.includes(site.id)
          const focused =
            activeElectrodes !== null && activeElectrodes.includes(site.id)
          return (
            <ElectrodeMarker
              key={site.id}
              site={site}
              active={active}
              focused={focused}
              onSelect={() => {
                const lead = site.leads[0] ?? null
                onSelectLead(
                  selectedLead && site.leads.includes(selectedLead)
                    ? null
                    : lead,
                )
              }}
            />
          )
        })}

      {layers.leads &&
        LEAD_PLACEMENT_LABELS.map((label) => {
          const selected = selectedLead === label.lead
          const dimmed = selectedLead !== null && !selected
          return (
            <LeadCallout
              key={label.lead}
              lead={label.lead}
              position={label.position}
              color={label.color}
              noteZh={label.noteZh}
              noteEn={label.noteEn}
              selected={selected}
              dimmed={dimmed}
              onSelect={() =>
                onSelectLead(selected ? null : label.lead)
              }
            />
          )
        })}
    </group>
  )
}

function TranslucentTorso() {
  const shell = {
    color: '#5b6b82',
    emissive: '#243044',
    opacity: 0.42,
  } as const

  return (
    <group>
      {/* Outer rim — brighter edge so the silhouette reads on dark bg */}
      <mesh position={[0, -0.15, -0.12]} scale={[1.18, 1.38, 0.72]}>
        <sphereGeometry args={[1.35, 48, 32]} />
        <meshStandardMaterial
          color="#8fa3bc"
          emissive="#3d4f66"
          emissiveIntensity={0.25}
          transparent
          opacity={0.18}
          roughness={0.9}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      {/* Chest / abdomen shell */}
      <mesh position={[0, -0.15, -0.15]} scale={[1.15, 1.35, 0.7]}>
        <sphereGeometry args={[1.35, 48, 32]} />
        <meshStandardMaterial
          color={shell.color}
          emissive={shell.emissive}
          emissiveIntensity={0.2}
          transparent
          opacity={shell.opacity}
          roughness={0.82}
          metalness={0.06}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      {/* Shoulders */}
      <mesh position={[-0.95, 0.95, -0.05]} scale={[0.55, 0.4, 0.45]}>
        <sphereGeometry args={[0.7, 24, 16]} />
        <meshStandardMaterial
          color={shell.color}
          emissive={shell.emissive}
          emissiveIntensity={0.18}
          transparent
          opacity={0.4}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0.95, 0.95, -0.05]} scale={[0.55, 0.4, 0.45]}>
        <sphereGeometry args={[0.7, 24, 16]} />
        <meshStandardMaterial
          color={shell.color}
          emissive={shell.emissive}
          emissiveIntensity={0.18}
          transparent
          opacity={0.4}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.45, -0.1]}>
        <cylinderGeometry args={[0.28, 0.32, 0.45, 18]} />
        <meshStandardMaterial
          color={shell.color}
          emissive={shell.emissive}
          emissiveIntensity={0.15}
          transparent
          opacity={0.38}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      {/* Soft posterior depth cue */}
      <mesh position={[0, -0.1, -0.55]} scale={[1.05, 1.25, 0.35]}>
        <sphereGeometry args={[1.2, 32, 20]} />
        <meshStandardMaterial
          color="#3a4658"
          emissive="#1a222c"
          emissiveIntensity={0.12}
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
      {/* Waist taper */}
      <mesh position={[0, -1.35, -0.05]} scale={[0.95, 0.55, 0.55]}>
        <sphereGeometry args={[0.85, 28, 18]} />
        <meshStandardMaterial
          color={shell.color}
          emissive={shell.emissive}
          emissiveIntensity={0.12}
          transparent
          opacity={0.32}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}

function EinthovenHighlight({ lead }: { lead: 'I' | 'II' | 'III' }) {
  const ra = ELECTRODE_SITES.find((e) => e.id === 'RA')!.position
  const la = ELECTRODE_SITES.find((e) => e.id === 'LA')!.position
  const ll = ELECTRODE_SITES.find((e) => e.id === 'LL')!.position
  const segments: Record<'I' | 'II' | 'III', [number, number, number][]> = {
    I: [ra, la],
    II: [ra, ll],
    III: [la, ll],
  }
  return (
    <Line
      points={segments[lead]}
      color="#38bdf8"
      lineWidth={2.5}
      transparent
      opacity={0.85}
    />
  )
}

function ElectrodeMarker({
  site,
  active,
  focused,
  onSelect,
}: {
  site: ElectrodeSite
  active: boolean
  focused: boolean
  onSelect: () => void
}) {
  const { locale } = useLanguage()
  const place = locale === 'zh' ? site.placeZh : site.placeEn
  const labelPos: [number, number, number] = [
    site.position[0] + site.labelOffset[0],
    site.position[1] + site.labelOffset[1],
    site.position[2] + site.labelOffset[2],
  ]

  return (
    <group>
      <Line
        points={[site.position, labelPos]}
        color={site.color}
        lineWidth={focused ? 2.2 : 1}
        transparent
        opacity={!active ? 0.15 : focused ? 0.95 : 0.55}
      />
      <mesh
        position={site.position}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <sphereGeometry args={[focused ? 0.07 : 0.055, 16, 12]} />
        <meshStandardMaterial
          color={site.color}
          emissive={site.color}
          emissiveIntensity={focused ? 1.4 : active ? 0.45 : 0.08}
          transparent
          opacity={!active ? 0.2 : 1}
        />
      </mesh>
      {/* Soft contact pad */}
      <mesh position={site.position} scale={[1.6, 1.6, 0.35]}>
        <sphereGeometry args={[0.055, 12, 8]} />
        <meshStandardMaterial
          color={site.color}
          transparent
          opacity={!active ? 0.08 : focused ? 0.45 : 0.25}
          depthWrite={false}
        />
      </mesh>
      <Html
        position={labelPos}
        center
        zIndexRange={[25, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <button
          type="button"
          className={
            'electrode-tag' +
            (focused ? ' electrode-tag--focused' : '') +
            (!active ? ' electrode-tag--dimmed' : '')
          }
          style={{
            ['--electrode-color' as string]: site.color,
            pointerEvents: 'auto',
          }}
          title={`${site.id} · ${place}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
        >
          <span className="electrode-tag-id">{site.id}</span>
          <span className="electrode-tag-place">{place}</span>
        </button>
      </Html>
    </group>
  )
}

function LeadCallout({
  lead,
  position,
  color,
  noteZh,
  noteEn,
  selected,
  dimmed,
  onSelect,
}: {
  lead: LeadName
  position: [number, number, number]
  color: string
  noteZh: string
  noteEn: string
  selected: boolean
  dimmed: boolean
  onSelect: () => void
}) {
  const { locale } = useLanguage()
  const note = locale === 'zh' ? noteZh : noteEn

  return (
    <Html
      position={position}
      center
      zIndexRange={[30, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <button
        type="button"
        className={
          'lead-callout' +
          (selected ? ' lead-callout--selected' : '') +
          (dimmed ? ' lead-callout--dimmed' : '')
        }
        style={{
          ['--lead-color' as string]: color,
          pointerEvents: 'auto',
        }}
        title={note}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <span className="lead-callout-name">{lead}</span>
        {selected && <span className="lead-callout-note">{note}</span>}
      </button>
    </Html>
  )
}
