import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import type { HeartStructureId } from '../../anatomy/types'
import AnatomicalHeart from './AnatomicalHeart'

interface CardiacAnatomyViewportProps {
  selectedId: HeartStructureId | null
  myocardiumOpacity: number
  showLabels: boolean
  onSelect: (id: HeartStructureId | null) => void
}

/**
 * Interactive 3D viewport — rotate / zoom via OrbitControls.
 * The heart is the sole focal object (biological source model).
 */
export default function CardiacAnatomyViewport({
  selectedId,
  myocardiumOpacity,
  showLabels,
  onSelect,
}: CardiacAnatomyViewportProps) {
  return (
    <div className="anatomy-viewport" role="img" aria-label="Interactive 3D cardiac anatomy">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [2.8, 1.2, 3.6], fov: 40, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={() => onSelect(null)}
      >
        <color attach="background" args={['#0b1219']} />

        <ambientLight intensity={0.55} />
        <directionalLight
          position={[3.2, 4.5, 2.8]}
          intensity={1.65}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-2.5, 1.2, -1.8]} intensity={0.45} />
        <directionalLight position={[0.5, 1.5, 3.5]} intensity={0.55} color="#ffe8dc" />
        <hemisphereLight args={['#b8c8d8', '#1a1010', 0.35]} />

        <AnatomicalHeart
          selectedId={selectedId}
          myocardiumOpacity={myocardiumOpacity}
          showLabels={showLabels}
          onSelect={onSelect}
        />

        <ContactShadows
          position={[0, -1.85, 0]}
          opacity={0.45}
          scale={8}
          blur={2.5}
          far={4}
        />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.86, 0]}
          receiveShadow
          onClick={() => onSelect(null)}
        >
          <circleGeometry args={[3.2, 48]} />
          <meshStandardMaterial color="#0a1018" roughness={1} metalness={0} />
        </mesh>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={2.2}
          maxDistance={9}
          target={[0, -0.05, 0]}
          enablePan={false}
        />
      </Canvas>

      <div className="anatomy-viewport-hint" aria-hidden>
        Drag to rotate · Scroll to zoom · Click a chamber to select
      </div>
    </div>
  )
}
