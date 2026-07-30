import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import type { HeartVersion } from '../../anatomy/heartVersions'
import type { ConductionState, LeadName } from '../../ecg/types'
import type { PhysiologicalEvent } from '../../sim/events'
import OrientationCube from '../OrientationCube'
import HeartConductionV1 from '../heart/HeartConductionV1'
import HeartAnatomyV2 from '../heart/HeartAnatomyV2'
import HeartTorsoV3 from '../heart/HeartTorsoV3'
import ConductionTimeline from './ConductionTimeline'

interface CardiacAnatomyViewportProps {
  heartVersion: HeartVersion
  selectedLead: LeadName | null
  onSelectLead: (lead: LeadName | null) => void
  showLabels: boolean
  conduction: ConductionState
  activeEvent: PhysiologicalEvent | null
  phaseMs: number
  elapsed: number
  timeScale: number
  rateBpm: number
}

/**
 * Shared 3D viewport for V1 / V2 / V3.
 * Conduction glow is driven exclusively by `conduction` from the EP engine.
 * OrientationCube (A/P/L/R/H/B) tracks camera on every version.
 */
export default function CardiacAnatomyViewport({
  heartVersion,
  selectedLead,
  onSelectLead,
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
  const camera = isV3
    ? { position: [0.15, 0.55, 4.6] as [number, number, number], fov: 40 }
    : { position: [2.6, 1.4, 3.4] as [number, number, number], fov: 42 }

  return (
    <div
      className="anatomy-viewport"
      role="img"
      aria-label={`Interactive 3D cardiac anatomy (${heartVersion.toUpperCase()})`}
    >
      <Canvas
        key={heartVersion}
        shadows
        dpr={[1, 1.75]}
        camera={{ ...camera, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={() => onSelectLead(null)}
      >
        <color
          attach="background"
          args={[isV3 ? '#0a1018' : heartVersion === 'v2' ? '#0c121a' : '#070d14']}
        />

        <ambientLight intensity={isV3 ? 0.95 : 0.85} />
        <directionalLight
          position={[3.5, 4.5, 2.5]}
          intensity={isV3 ? 2.0 : 1.75}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 1.5, -2]} intensity={0.75} />
        <directionalLight position={[0, 2, 4]} intensity={0.55} color="#ffe8e0" />
        <pointLight
          position={[0.2, 0.8, 1.5]}
          intensity={0.55 + conduction.sa * 0.9}
          color="#7dffb0"
        />
        <hemisphereLight args={['#b8c8d8', '#1a1010', 0.3]} />

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

        <ContactShadows
          position={[0, isV3 ? -2.15 : -1.85, 0]}
          opacity={0.4}
          scale={isV3 ? 10 : 8}
          blur={2.5}
          far={4}
        />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, isV3 ? -2.16 : -1.86, 0]}
          receiveShadow
          onClick={() => onSelectLead(null)}
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
          target={isV3 ? [0, 0.05, 0] : [0, -0.1, 0]}
          enablePan={false}
        />

        <OrientationCube />
      </Canvas>

      <ConductionTimeline
        phaseMs={phaseMs}
        active={activeEvent}
        status={conduction.status}
        elapsed={elapsed}
        timeScale={timeScale}
        rateBpm={rateBpm}
      />

      <div className="orientation-legend" aria-hidden>
        <span title="Anterior">A</span>
        <span title="Posterior">P</span>
        <span title="Left">L</span>
        <span title="Right">R</span>
        <span title="Head">H</span>
        <span title="Bottom">B</span>
      </div>

      <div className="anatomy-viewport-hint" aria-hidden>
        Glow follows physiological events · Cube snaps to A/P/L/R/H/B
      </div>
    </div>
  )
}
