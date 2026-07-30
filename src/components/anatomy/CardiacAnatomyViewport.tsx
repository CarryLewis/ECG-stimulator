import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import type { HeartVersion } from '../../anatomy/heartVersions'
import type { HeartStructureId } from '../../anatomy/types'
import type { ConductionState, LeadName } from '../../ecg/types'
import type { PhysiologicalEvent } from '../../sim/events'
import OrientationCube, {
  CameraSync,
  OrientationLegend,
} from '../OrientationCube'
import HeartConductionV1 from '../heart/HeartConductionV1'
import HeartAnatomyV2 from '../heart/HeartAnatomyV2'
import HeartTorsoV3 from '../heart/HeartTorsoV3'
import AnatomicalHeart from './AnatomicalHeart'
import ConductionTimeline from './ConductionTimeline'

interface CardiacAnatomyViewportProps {
  heartVersion: HeartVersion
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
}

/**
 * Shared 3D viewport for source anatomy + V1 / V2 / V3.
 *
 * The orientation cube is a separate overlay Canvas so it cannot disable
 * R3F’s automatic heart-scene render (priority > 0 useFrame pitfall).
 */
export default function CardiacAnatomyViewport({
  heartVersion,
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
}: CardiacAnatomyViewportProps) {
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
  // Default = anterior (front) body view so the orientation cube shows A,
  // matching “正对着心脏看” / clinical frontal reference.
  const camera = isV3
    ? { position: [0, 0.2, 4.5] as [number, number, number], fov: 40 }
    : { position: [0, 0.15, 4.2] as [number, number, number], fov: 40 }

  const clearSelection = () => {
    onSelectLead(null)
    onSelectStructure(null)
  }

  return (
    <div
      className="anatomy-viewport"
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

        <ambientLight intensity={0.95} />
        <directionalLight position={[3.2, 4.5, 2.8]} intensity={1.8} />
        <directionalLight position={[-2.5, 1.2, -1.8]} intensity={0.55} />
        <directionalLight
          position={[0.5, 1.5, 3.5]}
          intensity={0.65}
          color="#ffe8dc"
        />
        <pointLight
          position={[0.2, 0.8, 1.5]}
          intensity={0.45 + conduction.sa * 0.7}
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
            <HeartConductionV1 state={conduction} showLabels={showLabels} />
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
          maxDistance={isV3 ? 10 : 8}
          target={isV3 ? [0, 0.05, 0] : [0, -0.15, 0]}
          enablePan={false}
        />

        <CameraSync />
      </Canvas>

      <OrientationCube />
      <OrientationLegend />

      <ConductionTimeline
        phaseMs={phaseMs}
        active={activeEvent}
        status={conduction.status}
        elapsed={elapsed}
        timeScale={timeScale}
        rateBpm={rateBpm}
      />

      <div className="anatomy-viewport-hint" aria-hidden>
        {isSource
          ? '立方体=人体方位：正对=A · 俯视=H · 仰视=B · 点击面可跳转'
          : 'Glow follows events · 立方体=人体方位 A/P/L/R/H/B'}
      </div>
    </div>
  )
}
