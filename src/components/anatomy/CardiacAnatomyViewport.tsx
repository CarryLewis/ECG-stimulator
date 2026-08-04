import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import type { HeartVersion } from '../../anatomy/heartVersions'
import type { HeartStructureId } from '../../anatomy/types'
import type { ConductionState, LeadName } from '../../ecg/types'
import type {
  InstantaneousElectricalField,
  MeanElectricalAxis,
} from '../../vector-engine'
import OrientationCube, {
  CameraSync,
  OrientationLegend,
} from '../OrientationCube'
import HeartConductionV1 from '../heart/HeartConductionV1'
import HeartAnatomyV2 from '../heart/HeartAnatomyV2'
import HeartTorsoV3 from '../heart/HeartTorsoV3'
import HeartVectorView from '../vector/HeartVectorView'
import AnatomicalHeart from './AnatomicalHeart'

interface CardiacAnatomyViewportProps {
  heartVersion: HeartVersion
  selectedStructureId: HeartStructureId | null
  onSelectStructure: (id: HeartStructureId | null) => void
  selectedLead: LeadName | null
  onSelectLead: (lead: LeadName | null) => void
  myocardiumOpacity: number
  showLabels: boolean
  conduction: ConductionState
  field: InstantaneousElectricalField
  axis: MeanElectricalAxis
  activationIntensity: number
}

/**
 * Primary 3D heart stage for the EP laboratory.
 * Clinical / ECG / timeline HUDs live in adjacent lab panels.
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
  field,
  axis,
  activationIntensity,
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
  const isVector = heartVersion === 'vector'
  const isSource = heartVersion === 'anatomy'
  const camera = isV3
    ? { position: [0, 0.15, 5.4] as [number, number, number], fov: 40 }
    : isVector
      ? { position: [2.2, 0.85, 3.5] as [number, number, number], fov: 40 }
      : { position: [2.6, 1.1, 3.4] as [number, number, number], fov: 40 }

  const clearSelection = () => {
    onSelectLead(null)
    onSelectStructure(null)
  }

  return (
    <div
      className="lab-viewport"
      role="img"
      aria-label={`Interactive 3D cardiac model (${heartVersion})`}
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
        <color attach="background" args={['#070b12']} />

        <ambientLight intensity={0.9} />
        <directionalLight position={[3.2, 4.5, 2.8]} intensity={1.65} />
        <directionalLight position={[-2.5, 1.2, -1.8]} intensity={0.45} />
        <directionalLight
          position={[0.5, 1.5, 3.5]}
          intensity={0.55}
          color="#e8f0ff"
        />
        <pointLight
          position={[0.2, 0.8, 1.5]}
          intensity={0.35 + conduction.sa * 0.55}
          color="#6ee7b7"
        />

        {isSource && (
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
        {isV3 && (
          <HeartTorsoV3
            state={conduction}
            selectedLead={selectedLead}
            onSelectLead={onSelectLead}
            layers={torsoLayers}
          />
        )}
        {isVector && (
          <HeartVectorView
            state={conduction}
            field={field}
            axis={axis}
            activationIntensity={activationIntensity}
            showLabels={showLabels}
          />
        )}

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, isV3 ? -2.55 : -1.86, 0]}
          onClick={clearSelection}
        >
          <circleGeometry args={[isV3 ? 3.8 : 2.6, 48]} />
          <meshStandardMaterial color="#060a10" roughness={1} metalness={0} />
        </mesh>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={isV3 ? 3.2 : 1.9}
          maxDistance={isV3 ? 12 : 7.5}
          target={isV3 ? [0, 0.0, 0] : [0, -0.15, 0]}
          enablePan={false}
        />

        <CameraSync />
      </Canvas>

      <OrientationCube />
      <OrientationLegend />

      <p className="lab-viewport-hint" aria-hidden>
        Drag to orbit · Scroll to zoom · Orientation cube: A / P / L / R / H / B
      </p>
    </div>
  )
}
