import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import { IDLE_CONDUCTION } from '../../anatomy/idleConduction'
import type { HeartVersion } from '../../anatomy/heartVersions'
import type { LeadName } from '../../ecg/types'
import OrientationCube from '../OrientationCube'
import HeartConductionV1 from '../heart/HeartConductionV1'
import HeartAnatomyV2 from '../heart/HeartAnatomyV2'
import HeartTorsoV3 from '../heart/HeartTorsoV3'

interface CardiacAnatomyViewportProps {
  heartVersion: HeartVersion
  selectedLead: LeadName | null
  onSelectLead: (lead: LeadName | null) => void
  showLabels: boolean
}

/**
 * Shared 3D viewport for all heart versions (V1 / V2 / V3).
 * OrientationCube (A/P/L/R/H/B) is always mounted and tracks camera rotation.
 */
export default function CardiacAnatomyViewport({
  heartVersion,
  selectedLead,
  onSelectLead,
  showLabels,
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
        <hemisphereLight args={['#b8c8d8', '#1a1010', 0.3]} />

        {heartVersion === 'v1' && (
          <group scale={1.08} position={[0, 0.05, 0]}>
            <HeartConductionV1 state={IDLE_CONDUCTION} />
          </group>
        )}
        {heartVersion === 'v2' && (
          <group scale={1.05} position={[0, 0.05, 0]}>
            <HeartAnatomyV2
              state={IDLE_CONDUCTION}
              selectedLead={selectedLead}
              onSelectLead={onSelectLead}
              layers={anatomyLayers}
            />
          </group>
        )}
        {heartVersion === 'v3' && (
          <HeartTorsoV3
            state={IDLE_CONDUCTION}
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

        {/* Present on every heart version — mirrors camera, face click snaps view */}
        <OrientationCube />
      </Canvas>

      <div className="orientation-legend" aria-hidden>
        <span title="Anterior">A</span>
        <span title="Posterior">P</span>
        <span title="Left">L</span>
        <span title="Right">R</span>
        <span title="Head">H</span>
        <span title="Bottom">B</span>
      </div>

      <div className="anatomy-viewport-hint" aria-hidden>
        Drag to rotate · Scroll to zoom · Cube faces snap to A/P/L/R/H/B
      </div>
    </div>
  )
}
