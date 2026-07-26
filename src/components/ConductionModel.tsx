import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo, useState } from 'react'
import { conductionAt } from '../ecg/conduction'
import {
  LEAD_LANDMARK_BY_NAME,
  TERRITORY_COLOR,
} from '../ecg/leadMap'
import type { CyclePlan, LeadName } from '../ecg/types'
import { useLanguage } from '../i18n/useLanguage'
import HeartAnatomyV2, { type AnatomyLayer } from './heart/HeartAnatomyV2'
import HeartConductionV1 from './heart/HeartConductionV1'

export type HeartVersion = 'v1' | 'v2'

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
  layers,
}: {
  version: HeartVersion
  state: ReturnType<typeof conductionAt>
  selectedLead: LeadName | null
  onSelectLead: (lead: LeadName | null) => void
  layers: Record<AnatomyLayer, boolean>
}) {
  const bg = version === 'v2' ? '#0c121a' : '#070d14'
  return (
    <>
      <color attach="background" args={[bg]} />
      <ambientLight intensity={version === 'v2' ? 0.55 : 0.45} />
      <directionalLight
        position={[3.5, 4.5, 2.5]}
        intensity={1.35}
        castShadow
      />
      <directionalLight position={[-3, 1.5, -2]} intensity={0.4} />
      <pointLight
        position={[0.2, 0.8, 1.5]}
        intensity={0.45 + state.sa * 0.7}
        color="#7dffb0"
      />

      {version === 'v1' ? (
        <HeartConductionV1 state={state} />
      ) : (
        <HeartAnatomyV2
          state={state}
          selectedLead={selectedLead}
          onSelectLead={onSelectLead}
          layers={layers}
        />
      )}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.85, 0]}
        receiveShadow
        onClick={() => onSelectLead(null)}
      >
        <circleGeometry args={[2.6, 48]} />
        <meshStandardMaterial color="#0a121c" roughness={1} metalness={0} />
      </mesh>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={2.2}
        maxDistance={8}
        target={[0, -0.15, 0]}
      />
    </>
  )
}

/**
 * Freely rotatable 3D heart — V1 conduction schematic or V2 lead-atlas anatomy.
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
  const [layers, setLayers] = useState<Record<AnatomyLayer, boolean>>({
    walls: true,
    pins: true,
  })

  const landmark = selectedLead ? LEAD_LANDMARK_BY_NAME[selectedLead] : null
  const scale = timeScale.toFixed(2)

  const statusText = useMemo(() => {
    if (heartVersion === 'v1') {
      if (plan.fibrillatoryBaseline) return t('statusAf')
      if (plan.dissociated) return t('statusDissoc')
      return t('statusPr', { ms: Math.round(plan.prInterval * 1000) })
    }
    if (!landmark) return t('pickPinHint')
    const face = locale === 'zh' ? landmark.faceZh : landmark.faceEn
    const senses = locale === 'zh' ? landmark.sensesZh : landmark.sensesEn
    return t('leadSenseLine', { lead: landmark.lead, face, senses })
  }, [heartVersion, landmark, locale, plan, t])

  return (
    <div className="panel conduction-panel">
      <div className="conduction-toolbar">
        <h2 className="panel-title">{t('heartTitle')}</h2>
        <div
          className="heart-version-toggle"
          role="group"
          aria-label={t('heartVersionAria')}
        >
          <button
            type="button"
            className={
              'heart-version-btn' +
              (heartVersion === 'v1' ? ' heart-version-btn--active' : '')
            }
            onClick={() => onHeartVersionChange('v1')}
          >
            {t('v1Short')}
          </button>
          <button
            type="button"
            className={
              'heart-version-btn' +
              (heartVersion === 'v2' ? ' heart-version-btn--active' : '')
            }
            onClick={() => onHeartVersionChange('v2')}
          >
            {t('v2Short')}
          </button>
        </div>
      </div>

      <p className="panel-hint">
        {heartVersion === 'v1' ? t('hintV1', { scale }) : t('hintV2', { scale })}
      </p>

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
                'anatomy-layer-btn' + (layers.walls ? ' anatomy-layer-btn--active' : '')
              }
              onClick={() => setLayers((l) => ({ ...l, walls: !l.walls }))}
            >
              {t('layerWalls')}
            </button>
            <button
              type="button"
              className={
                'anatomy-layer-btn' + (layers.pins ? ' anatomy-layer-btn--active' : '')
              }
              onClick={() => setLayers((l) => ({ ...l, pins: !l.pins }))}
            >
              {t('layerPins')}
            </button>
          </div>
        </div>
      )}

      <div
        className="conduction-3d"
        role="img"
        aria-label={heartVersion === 'v1' ? t('ariaV1') : t('ariaV2')}
      >
        <Canvas
          key={heartVersion}
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [2.6, 1.4, 3.4], fov: 42, near: 0.1, far: 40 }}
          gl={{ antialias: true, alpha: false }}
        >
          <HeartScene
            version={heartVersion}
            state={state}
            selectedLead={selectedLead}
            onSelectLead={onSelectLead}
            layers={layers}
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
