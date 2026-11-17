import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import type { HeartVersion } from '../../anatomy/heartVersions'
import type { HeartStructureId } from '../../anatomy/types'
import type { ConductionState, CyclePlan, LeadName } from '../../ecg/types'
import { useLanguage } from '../../i18n'
import type { PhysiologicalEvent } from '../../sim/events'
import OrientationCube, {
  CameraSync,
  OrientationLegend,
} from '../OrientationCube'
import HeartVersionToggle from './HeartVersionToggle'
import HeartConductionV1 from '../heart/HeartConductionV1'
import HeartAnatomyV2 from '../heart/HeartAnatomyV2'
import HeartTorsoV3 from '../heart/HeartTorsoV3'
import AnatomicalHeart from './AnatomicalHeart'
import ConductionTimeline from './ConductionTimeline'
import SourceFraming from './SourceFraming'

interface CardiacAnatomyViewportProps {
  heartVersion: HeartVersion
  onHeartVersionChange: (v: HeartVersion) => void
  selectedStructureId: HeartStructureId | null
  onSelectStructure: (id: HeartStructureId | null) => void
  selectedLead: LeadName | null
  onSelectLead: (lead: LeadName | null) => void
  myocardiumOpacity: number
  showLabels: boolean
  conduction: ConductionState
  activeEvent: PhysiologicalEvent | null
  phaseMs: number
  elapsed: number
  timeScale: number
  rateBpm: number
  plan: CyclePlan
  completeBlock: boolean
}

/**
 * Shared 3D viewport for source anatomy + V1 / V2 / V3.
 *
 * Orientation cube is a DOM/CSS overlay (see OrientationCube.tsx). CameraSync
 * inside this Canvas snaps OrbitControls to body-axis views A/P/L/R/H/B.
 */
export default function CardiacAnatomyViewport({
  heartVersion,
  onHeartVersionChange,
  selectedStructureId,
  onSelectStructure,
  selectedLead,
  onSelectLead,
  myocardiumOpacity,
  showLabels,
  conduction,
  activeEvent,
  phaseMs,
  elapsed,
  timeScale,
  rateBpm,
  plan,
  completeBlock,
}: CardiacAnatomyViewportProps) {
  const { t, L } = useLanguage()
  const anatomyLayers = useMemo(
    () => ({ walls: true as const, pins: showLabels }),
    [showLabels],
  )
  const torsoLayers = useMemo(
    () => ({
      torso: true as const,
      heart: true as const,
      electrodes: showLabels,
      leads: showLabels,
    }),
    [showLabels],
  )

  const isV3 = heartVersion === 'v3'
  const isSource = heartVersion === 'anatomy'
  const camera = isV3
    ? { position: [0.12, 0.28, 4.1] as [number, number, number], fov: 40 }
    : { position: [2.8, 1.2, 3.6] as [number, number, number], fov: 40 }

  const clearSelection = () => {
    onSelectLead(null)
    onSelectStructure(null)
  }

  return (
    <div
      className={'anatomy-viewport' + (isSource ? ' anatomy-viewport--source' : '')}
      role="img"
      aria-label={`Interactive 3D cardiac anatomy (${heartVersion})`}
    >
      <Canvas
        key={heartVersion}
        shadows={false}
        dpr={[1, 1.5]}
        camera={{ ...camera, near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement
          const onLost = (e: Event) => {
            e.preventDefault()
            console.warn('[ECG] WebGL context lost — will restore')
          }
          const onRestored = () => {
            console.warn('[ECG] WebGL context restored')
          }
          canvas.addEventListener('webglcontextlost', onLost, false)
          canvas.addEventListener('webglcontextrestored', onRestored, false)
        }}
        onPointerMissed={clearSelection}
      >
        <color
          attach="background"
          args={[
            isV3
              ? '#0a1018'
              : heartVersion === 'v2'
                ? '#0c121a'
                : isSource
                  ? '#0b1219'
                  : '#070d14',
          ]}
        />

        <ambientLight intensity={isSource ? 0.65 : 0.95} />
        <directionalLight position={[3.2, 4.5, 2.8]} intensity={isSource ? 1.4 : 1.8} />
        <directionalLight position={[-2.5, 1.2, -1.8]} intensity={0.55} />
        <directionalLight
          position={[0.5, 1.5, 3.5]}
          intensity={0.65}
          color="#ffe8dc"
        />
        <pointLight
          position={[0.2, 0.8, 1.5]}
          intensity={isSource ? 0 : 0.45 + conduction.sa * 0.7}
          color="#7dffb0"
        />

        {heartVersion === 'anatomy' && (
          <AnatomicalHeart
            selectedId={selectedStructureId}
            myocardiumOpacity={myocardiumOpacity}
            showLabels={showLabels}
            onSelect={onSelectStructure}
            conduction={conduction}
          />
        )}
        {heartVersion === 'v1' && (
          <group scale={1.08} position={[0, 0.05, 0]}>
            <HeartConductionV1 state={conduction} showLabels={showLabels}
              showConductionPath={!plan.ventricularFibrillation && !plan.ventricularFlutter
                && !plan.fibrillatoryBaseline && !plan.flutterBaseline && !plan.irregular}
              completeBlock={completeBlock} />
          </group>
        )}
        {heartVersion === 'v2' && (
          <group scale={1.05} position={[0, 0.05, 0]}>
            <HeartAnatomyV2
              state={conduction}
              selectedLead={selectedLead}
              onSelectLead={onSelectLead}
              layers={anatomyLayers}
            />
          </group>
        )}
        {heartVersion === 'v3' && (
          <HeartTorsoV3
            state={conduction}
            selectedLead={selectedLead}
            onSelectLead={onSelectLead}
            layers={torsoLayers}
          />
        )}

        <mesh
          visible={!isSource}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, isV3 ? -2.16 : -1.86, 0]}
          onClick={clearSelection}
        >
          <circleGeometry args={[isV3 ? 3.2 : 2.6, 48]} />
          <meshStandardMaterial color="#0a1018" roughness={1} metalness={0} />
        </mesh>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={isV3 ? 2.6 : 2.0}
          maxDistance={isSource ? 18 : isV3 ? 10 : 8}
          target={isV3 ? [0, 0.02, 0] : [0, -0.15, 0]}
          enablePan={false}
        />

        <CameraSync />
        {isSource && <SourceFraming />}
      </Canvas>

      {isSource && <div className="source-view-caption">
        <span>SOURCE / ANATOMY</span>
        <strong>{L(selectedStructureId === 'septum'
          ? { en: 'Septal cutaway', zh: '室间隔剖面' }
          : { en: 'Cardiac anatomy', zh: '心脏解剖' })}</strong>
        <small>{L({ en: 'Simplified teaching model', zh: '简化教学模型' })}</small>
      </div>}

      <div className="viewport-top-right">
        <div className="viewport-controls-stack">
          <OrientationLegend />
          <HeartVersionToggle
            heartVersion={heartVersion}
            onHeartVersionChange={onHeartVersionChange}
          />
        </div>
        <OrientationCube />
      </div>

      <ConductionTimeline
        phaseMs={phaseMs}
        active={activeEvent}
        status={conduction.status}
        elapsed={elapsed}
        timeScale={timeScale}
        rateBpm={rateBpm}
        plan={plan}
        state={conduction}
      />

      {isSource ? <div className="source-view-footer">
        <div className="source-electrical-legend" aria-label={L({ en: 'Visual key', zh: '视觉图例' })}>
          <span><i className="source-key--selected" />{L({ en: 'Selected', zh: '选中结构' })}</span>
          <span><i className="source-key--depol" />{L({ en: 'Depolarization', zh: '除极' })}</span>
          <span><i className="source-key--repol" />{L({ en: 'Repolarization', zh: '复极' })}</span>
        </div>
        {selectedStructureId === 'septum'
          ? <button type="button" className="source-restore" onClick={() => onSelectStructure(null)}>
              {L({ en: 'Close cutaway', zh: '关闭剖面，恢复外观' })}
            </button>
          : <p>{t('hintSource')}</p>}
      </div> : <div className="anatomy-viewport-hint" aria-hidden>{t('hintGlow')}</div>}
    </div>
  )
}
