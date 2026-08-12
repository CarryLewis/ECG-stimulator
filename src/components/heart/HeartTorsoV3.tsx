import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import {
  ELECTRODE_SITES,
  LEAD_ELECTRODES,
  LEAD_PLACEMENT_LABELS,
  type ElectrodeSite,
} from '../../ecg/electrodeMap'
import type { ConductionState, LeadName } from '../../ecg/types'
import { useLanguage } from '../../i18n'
import HumanBodyContour from './HumanBodyContour'
import RealisticHeart from './RealisticHeart'

export type TorsoLayer = 'torso' | 'heart' | 'electrodes' | 'leads'

interface HeartTorsoV3Props {
  state: ConductionState
  selectedLead: LeadName | null
  onSelectLead: (lead: LeadName | null) => void
  layers: Record<TorsoLayer, boolean>
}

/**
 * Version 3 — clinical 12-lead placement schematic:
 * clear proportional human body contour + mediastinal heart +
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
    <group position={[0, 0.02, 0]}>
      {layers.torso && <HumanBodyContour />}

      {layers.heart && <RealisticHeart state={state} />}

      {/* Midsternal + left mid-clavicular guides for placement teaching */}
      {layers.torso && <PlacementGuides />}

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

function PlacementGuides() {
  const midSternal = useMemo<[number, number, number][]>(
    () => [
      [0, 1.2, 0.55],
      [0, -0.7, 0.55],
    ],
    [],
  )
  const midClavicular = useMemo<[number, number, number][]>(
    () => [
      [0.55, 1.1, 0.42],
      [0.55, -0.55, 0.55],
    ],
    [],
  )

  return (
    <group>
      <Line
        points={midSternal}
        color="#cbd5e1"
        lineWidth={1.5}
        transparent
        opacity={0.5}
        dashed
        dashSize={0.08}
        gapSize={0.05}
      />
      <Line
        points={midClavicular}
        color="#94a3b8"
        lineWidth={1.25}
        transparent
        opacity={0.4}
        dashed
        dashSize={0.07}
        gapSize={0.05}
      />
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
        zIndexRange={[12, 0]}
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
      zIndexRange={[14, 0]}
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
