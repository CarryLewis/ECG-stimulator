import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo, useState } from 'react'
import { conductionAt } from '../ecg/conduction'
import {
  LEAD_ELECTRODES,
  LEAD_PLACEMENT_BY_NAME,
} from '../ecg/electrodeMap'
import {
  LEAD_LANDMARK_BY_NAME,
  TERRITORY_COLOR,
} from '../ecg/leadMap'
import type { CyclePlan, LeadName } from '../ecg/types'
import { useLanguage } from '../i18n/useLanguage'
import HeartAnatomyV2, { type AnatomyLayer } from './heart/HeartAnatomyV2'
import HeartConductionV1 from './heart/HeartConductionV1'
import HeartTorsoV3, { type TorsoLayer } from './heart/HeartTorsoV3'

export type HeartVersion = 'v1' | 'v2' | 'v3'

interface ConductionModelProps {
  plan: CyclePlan
  elapsed: number
  afSeed?: number
  timeScale?: number
  heartVersion: HeartVersion
  onHeartVersionChange: (v: HeartVersion) => void
  selectedLead: LeadName | null
  onSelectLead: (lead: LeadName | null) => void
}

function HeartScene({
  version,
  state,
  selectedLead,
  onSelectLead,
  anatomyLayers,
  torsoLayers,
}: {
  version: HeartVersion
  state: ReturnType<typeof conductionAt>
  selectedLead: LeadName | null
  onSelectLead: (lead: LeadName | null) => void
  anatomyLayers: Record<AnatomyLayer, boolean>
  torsoLayers: Record<TorsoLayer, boolean>
}) {
  const bg =
    version === 'v3' ? '#0a1018' : version === 'v2' ? '#0c121a' : '#070d14'
  const camTarget: [number, number, number] =
    version === 'v3' ? [0, 0.05, 0] : [0, -0.15, 0]

  return (
    <>
      <color attach="background" args={[bg]} />
      <ambientLight intensity={version === 'v3' ? 0.72 : version === 'v2' ? 0.55 : 0.45} />
      <directionalLight
        position={[3.5, 4.5, 2.5]}
        intensity={version === 'v3' ? 1.55 : 1.35}
        castShadow
      />
      <directionalLight position={[-3, 1.5, -2]} intensity={version === 'v3' ? 0.55 : 0.4} />
      {version === 'v3' && (
        <directionalLight position={[0, 2.5, 4]} intensity={0.45} color="#b8d4f0" />
      )}
      <pointLight
        position={[0.2, 0.8, 1.5]}
        intensity={0.45 + state.sa * 0.7}
        color="#7dffb0"
      />

      {version === 'v1' && <HeartConductionV1 state={state} />}
      {version === 'v2' && (
        <HeartAnatomyV2
          state={state}
          selectedLead={selectedLead}
          onSelectLead={onSelectLead}
          layers={anatomyLayers}
        />
      )}
      {version === 'v3' && (
        <HeartTorsoV3
          state={state}
          selectedLead={selectedLead}
          onSelectLead={onSelectLead}
          layers={torsoLayers}
        />
      )}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, version === 'v3' ? -2.15 : -1.85, 0]}
        receiveShadow
        onClick={() => onSelectLead(null)}
      >
        <circleGeometry args={[version === 'v3' ? 3.2 : 2.6, 48]} />
        <meshStandardMaterial color="#0a121c" roughness={1} metalness={0} />
      </mesh>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={version === 'v3' ? 2.8 : 2.2}
        maxDistance={version === 'v3' ? 10 : 8}
        target={camTarget}
      />
    </>
  )
}

/**
 * Freely rotatable 3D heart — V1 conduction, V2 lead atlas, or V3 torso
 * electrode-placement schematic.
 */
export default function ConductionModel({
  plan,
  elapsed,
  afSeed = 23,
  timeScale = 0.35,
  heartVersion,
  onHeartVersionChange,
  selectedLead,
  onSelectLead,
}: ConductionModelProps) {
  const { locale, t } = useLanguage()
  const state = conductionAt(plan, elapsed, { afSeed })
  const [anatomyLayers, setAnatomyLayers] = useState<
    Record<AnatomyLayer, boolean>
  >({
    walls: true,
    pins: true,
  })
  const [torsoLayers, setTorsoLayers] = useState<Record<TorsoLayer, boolean>>({
    torso: true,
    ribs: true,
    heart: true,
    electrodes: true,
    leads: true,
  })

  const landmark = selectedLead ? LEAD_LANDMARK_BY_NAME[selectedLead] : null
  const placement = selectedLead ? LEAD_PLACEMENT_BY_NAME[selectedLead] : null
  const scale = timeScale.toFixed(2)

  const statusText = useMemo(() => {
    if (heartVersion === 'v1') {
      if (plan.fibrillatoryBaseline) return t('statusAf')
      if (plan.dissociated) return t('statusDissoc')
      return t('statusPr', { ms: Math.round(plan.prInterval * 1000) })
    }
    if (heartVersion === 'v3') {
      if (!placement || !selectedLead) return t('pickElectrodeHint')
      const note = locale === 'zh' ? placement.noteZh : placement.noteEn
      const electrodes = LEAD_ELECTRODES[selectedLead].join(' + ')
      return t('electrodeSenseLine', {
        lead: selectedLead,
        electrodes,
        note,
      })
    }
    if (!landmark) return t('pickPinHint')
    const face = locale === 'zh' ? landmark.faceZh : landmark.faceEn
    const senses = locale === 'zh' ? landmark.sensesZh : landmark.sensesEn
    return t('leadSenseLine', { lead: landmark.lead, face, senses })
  }, [heartVersion, landmark, locale, placement, plan, selectedLead, t])

  const camera =
    heartVersion === 'v3'
      ? { position: [0.15, 0.55, 4.6] as [number, number, number], fov: 40 }
      : { position: [2.6, 1.4, 3.4] as [number, number, number], fov: 42 }

  const aria =
    heartVersion === 'v1'
      ? t('ariaV1')
      : heartVersion === 'v2'
        ? t('ariaV2')
        : t('ariaV3')

  const hint =
    heartVersion === 'v1'
      ? t('hintV1', { scale })
      : heartVersion === 'v2'
        ? t('hintV2', { scale })
        : t('hintV3', { scale })

  return (
    <div className="panel conduction-panel">
      <div className="conduction-toolbar">
        <h2 className="panel-title">{t('heartTitle')}</h2>
        <div
          className="heart-version-toggle"
          role="group"
          aria-label={t('heartVersionAria')}
        >
          {(
            [
              ['v1', 'v1Short'],
              ['v2', 'v2Short'],
              ['v3', 'v3Short'],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              className={
                'heart-version-btn' +
                (heartVersion === v ? ' heart-version-btn--active' : '')
              }
              onClick={() => onHeartVersionChange(v)}
            >
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      <p className="panel-hint">{hint}</p>

      {heartVersion === 'v2' && (
        <div className="anatomy-layer-bar">
          <div className="anatomy-layer-title">
            <strong>{t('atlasTitle')}</strong>
            <span>
              {landmark
                ? t('selectedLead', { lead: landmark.lead })
                : t('selectPin')}
            </span>
          </div>
          <div className="anatomy-layer-toggles">
            <button
              type="button"
              className={
                'anatomy-layer-btn' +
                (anatomyLayers.walls ? ' anatomy-layer-btn--active' : '')
              }
              onClick={() =>
                setAnatomyLayers((l) => ({ ...l, walls: !l.walls }))
              }
            >
              {t('layerWalls')}
            </button>
            <button
              type="button"
              className={
                'anatomy-layer-btn' +
                (anatomyLayers.pins ? ' anatomy-layer-btn--active' : '')
              }
              onClick={() =>
                setAnatomyLayers((l) => ({ ...l, pins: !l.pins }))
              }
            >
              {t('layerPins')}
            </button>
          </div>
        </div>
      )}

      {heartVersion === 'v3' && (
        <div className="anatomy-layer-bar">
          <div className="anatomy-layer-title">
            <strong>{t('torsoTitle')}</strong>
            <span>
              {selectedLead
                ? t('selectedLead', { lead: selectedLead })
                : t('selectElectrode')}
            </span>
          </div>
          <div className="anatomy-layer-toggles">
            {(
              [
                ['torso', 'layerTorso'],
                ['ribs', 'layerRibs'],
                ['heart', 'layerHeart'],
                ['electrodes', 'layerElectrodes'],
                ['leads', 'layerLeadLabels'],
              ] as const
            ).map(([key, msg]) => (
              <button
                key={key}
                type="button"
                className={
                  'anatomy-layer-btn' +
                  (torsoLayers[key] ? ' anatomy-layer-btn--active' : '')
                }
                onClick={() =>
                  setTorsoLayers((l) => ({ ...l, [key]: !l[key] }))
                }
              >
                {t(msg)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="conduction-3d" role="img" aria-label={aria}>
        <Canvas
          key={heartVersion}
          shadows
          dpr={[1, 1.75]}
          camera={{ ...camera, near: 0.1, far: 40 }}
          gl={{ antialias: true, alpha: false }}
        >
          <HeartScene
            version={heartVersion}
            state={state}
            selectedLead={selectedLead}
            onSelectLead={onSelectLead}
            anatomyLayers={anatomyLayers}
            torsoLayers={torsoLayers}
          />
        </Canvas>
      </div>

      <div className="conduction-status">{statusText}</div>

      {heartVersion === 'v2' ? (
        <div className="territory-legend">
          {(
            [
              ['anterior', 'wallAnterior'],
              ['septal', 'wallSeptal'],
              ['lateral', 'wallLateral'],
              ['inferior', 'wallInferior'],
            ] as const
          ).map(([key, msg]) => (
            <span key={key} className="territory-chip">
              <span
                className="territory-swatch"
                style={{ background: TERRITORY_COLOR[key] }}
              />
              {t(msg)}
            </span>
          ))}
        </div>
      ) : heartVersion === 'v3' ? (
        <div className="territory-legend">
          <span className="territory-chip">
            <span
              className="territory-swatch"
              style={{ background: '#f87171' }}
            />
            {t('legendLimb')}
          </span>
          <span className="territory-chip">
            <span
              className="territory-swatch"
              style={{ background: TERRITORY_COLOR.anterior }}
            />
            {t('legendPrecordial')}
          </span>
          <span className="conduction-drag-hint">{t('dragHint')}</span>
        </div>
      ) : (
        <div className="conduction-legend">
          <span className="legend-dot legend-dot--idle" /> {t('resting')}
          <span className="legend-dot legend-dot--active" /> {t('depolarising')}
          <span className="conduction-drag-hint">{t('dragHint')}</span>
        </div>
      )}
    </div>
  )
}
