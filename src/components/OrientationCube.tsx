import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { useFrame, useThree, createPortal } from '@react-three/fiber'
import {
  BoxGeometry,
  CanvasTexture,
  Matrix4,
  Mesh,
  OrthographicCamera,
  Quaternion,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
} from 'three'

/**
 * Medical-imaging orientation cube — CT/MRI viewer style.
 *
 * Renders via a portalled orthographic scene into the top-right corner of
 * the parent R3F Canvas. Mirrors the main camera orientation; clicking a
 * face smoothly animates the camera to that anatomical view.
 *
 * Reusable — depends only on R3F + three.js.
 *
 * Labels (body axes: +x left, +y superior, +z anterior):
 *   A = Anterior (+z)  P = Posterior (−z)
 *   L = Left (+x)      R = Right (−x)
 *   H = Head (+y)      F = Foot (−y)
 */

// ─── Face definitions ────────────────────────────────────────────────────────

interface CubeFace {
  id: string
  label: string
  normal: Vector3
  rotation: [number, number, number]
  position: [number, number, number]
  baseColor: string
  hoverColor: string
}

const S = 0.502

const FACES: CubeFace[] = [
  { id: 'A', label: 'A', normal: new Vector3(0, 0, 1),  rotation: [0, 0, 0],               position: [0, 0, S],  baseColor: '#1a3355', hoverColor: '#2b5a8c' },
  { id: 'P', label: 'P', normal: new Vector3(0, 0, -1), rotation: [0, Math.PI, 0],          position: [0, 0, -S], baseColor: '#1a3355', hoverColor: '#2b5a8c' },
  { id: 'L', label: 'L', normal: new Vector3(1, 0, 0),  rotation: [0, Math.PI / 2, 0],      position: [S, 0, 0],  baseColor: '#1a4035', hoverColor: '#2a6a50' },
  { id: 'R', label: 'R', normal: new Vector3(-1, 0, 0), rotation: [0, -Math.PI / 2, 0],     position: [-S, 0, 0], baseColor: '#1a4035', hoverColor: '#2a6a50' },
  { id: 'H', label: 'H', normal: new Vector3(0, 1, 0),  rotation: [-Math.PI / 2, 0, 0],     position: [0, S, 0],  baseColor: '#3d1a1a', hoverColor: '#6a3535' },
  { id: 'F', label: 'F', normal: new Vector3(0, -1, 0), rotation: [Math.PI / 2, 0, 0],      position: [0, -S, 0], baseColor: '#3d1a1a', hoverColor: '#6a3535' },
]

// ─── Shared ──────────────────────────────────────────────────────────────────

const BOX_GEO = new BoxGeometry(1, 1, 1)
const _q = new Quaternion()
const _v = new Vector3()
const _m = new Matrix4()
const _ray = new Raycaster()
const _ndc = new Vector2()

// ─── Label texture ───────────────────────────────────────────────────────────

function makeLabelTex(text: string, bright: boolean): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 128, 128)
  ctx.fillStyle = bright ? '#ffffff' : '#c5d4e8'
  ctx.font = 'bold 74px "IBM Plex Mono","SF Mono",ui-monospace,monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 64, 68)
  const tex = new CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function OrientationCube({ size = 105 }: { size?: number }) {
  const { camera: mainCamera, gl, size: canvasSize } = useThree()
  const cubeScene = useMemo(() => new Scene(), [])
  const cubeCam = useRef<OrthographicCamera | null>(null)
  const faceMeshes = useRef<Record<string, Mesh>>({})
  const [hovered, setHovered] = useState<string | null>(null)

  const animRef = useRef({
    targetQuat: new Quaternion(),
    targetPos: new Vector3(),
    active: false,
  })

  // Ortho camera
  useEffect(() => {
    const cam = new OrthographicCamera(-1.2, 1.2, 1.2, -1.2, 0.1, 20)
    cam.position.set(0, 0, 4)
    cam.lookAt(0, 0, 0)
    cubeCam.current = cam
  }, [])

  // Label textures
  const textures = useMemo(() => {
    const map: Record<string, { normal: CanvasTexture; bright: CanvasTexture }> = {}
    for (const f of FACES) {
      map[f.id] = { normal: makeLabelTex(f.label, false), bright: makeLabelTex(f.label, true) }
    }
    return map
  }, [])

  // Pixel viewport (top-right)
  const vp = useMemo(() => {
    const dpr = gl.getPixelRatio()
    const w = Math.round(canvasSize.width * dpr)
    const h = Math.round(canvasSize.height * dpr)
    const s = Math.round(size * dpr)
    return { x: w - s - 4, y: h - s - 4, w: s, h: s }
  }, [canvasSize, gl, size])

  // CSS-px region for pointer hit-testing
  const cssRect = useMemo(
    () => ({
      left: canvasSize.width - size - 4 / gl.getPixelRatio(),
      top: 4 / gl.getPixelRatio(),
      size,
    }),
    [canvasSize, gl, size],
  )

  // Fly-to on face click
  const flyTo = useCallback(
    (face: CubeFace) => {
      const dist = mainCamera.position.length()
      const pos = face.normal.clone().multiplyScalar(dist)
      const up =
        Math.abs(face.normal.y) > 0.9
          ? new Vector3(0, 0, -Math.sign(face.normal.y))
          : new Vector3(0, 1, 0)
      _m.lookAt(pos, new Vector3(0, 0, 0), up)
      const quat = new Quaternion().setFromRotationMatrix(_m)
      animRef.current = { targetQuat: quat, targetPos: pos, active: true }
    },
    [mainCamera],
  )

  // Pointer interaction: raycast into the cube scene via the ortho cam
  const hitTest = useCallback(
    (cssX: number, cssY: number): CubeFace | null => {
      const cam = cubeCam.current
      if (!cam) return null
      const rx = ((cssX - cssRect.left) / cssRect.size) * 2 - 1
      const ry = -((cssY - cssRect.top) / cssRect.size) * 2 + 1
      if (Math.abs(rx) > 1 || Math.abs(ry) > 1) return null
      _ndc.set(rx, ry)
      _ray.setFromCamera(_ndc, cam)
      const meshes = Object.values(faceMeshes.current)
      const hits = _ray.intersectObjects(meshes, false)
      if (hits.length === 0) return null
      const name = hits[0].object.userData.faceId as string
      return FACES.find((f) => f.id === name) ?? null
    },
    [cssRect],
  )

  // Attach DOM listeners for hover + click on the canvas element
  useEffect(() => {
    const canvas = gl.domElement

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const face = hitTest(x, y)
      setHovered(face ? face.id : null)
      canvas.style.cursor =
        face && x >= cssRect.left && y <= cssRect.size + 4
          ? 'pointer'
          : ''
    }

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const face = hitTest(x, y)
      if (face) {
        e.stopPropagation()
        flyTo(face)
      }
    }

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('click', onClick, true)
    return () => {
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('click', onClick, true)
    }
  }, [gl, hitTest, flyTo, cssRect])

  // Per-frame render
  useFrame(() => {
    const cam = cubeCam.current
    if (!cam) return

    // Fly-to animation
    const anim = animRef.current
    if (anim.active) {
      mainCamera.getWorldQuaternion(_q)
      _q.slerp(anim.targetQuat, 0.1)
      const dist = mainCamera.position.length()
      _v.set(0, 0, dist).applyQuaternion(_q)
      mainCamera.position.copy(_v)
      mainCamera.quaternion.copy(_q)
      if (_q.angleTo(anim.targetQuat) < 0.003) {
        mainCamera.position.copy(anim.targetPos)
        mainCamera.lookAt(0, 0, 0)
        anim.active = false
      }
    }

    // Sync cube cam to main cam
    mainCamera.getWorldQuaternion(_q)
    cam.quaternion.copy(_q)
    _v.set(0, 0, 4).applyQuaternion(_q)
    cam.position.copy(_v)
    cam.updateMatrixWorld()

    // Render inset
    const autoClear = gl.autoClear
    gl.autoClear = false
    gl.clearDepth()
    gl.setViewport(vp.x, vp.y, vp.w, vp.h)
    gl.setScissor(vp.x, vp.y, vp.w, vp.h)
    gl.setScissorTest(true)
    gl.render(cubeScene, cam)
    gl.setScissorTest(false)
    const dpr = gl.getPixelRatio()
    gl.setViewport(0, 0, canvasSize.width * dpr, canvasSize.height * dpr)
    gl.autoClear = autoClear
  }, 1)

  // Store mesh refs for raycasting
  const setFaceMeshRef = useCallback(
    (id: string) => (el: Mesh | null) => {
      if (el) {
        el.userData.faceId = id
        faceMeshes.current[id] = el
      } else {
        delete faceMeshes.current[id]
      }
    },
    [],
  )

  return createPortal(
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 4]} intensity={0.85} />
      <directionalLight position={[-2, -1, -3]} intensity={0.25} />

      <lineSegments>
        <edgesGeometry args={[BOX_GEO]} />
        <lineBasicMaterial color="#8aa0bb" transparent opacity={0.5} />
      </lineSegments>

      {FACES.map((face) => {
        const isHov = hovered === face.id
        return (
          <group key={face.id} position={face.position} rotation={face.rotation}>
            <mesh ref={setFaceMeshRef(face.id)}>
              <planeGeometry args={[0.96, 0.96]} />
              <meshStandardMaterial
                color={isHov ? face.hoverColor : face.baseColor}
                transparent
                opacity={isHov ? 0.95 : 0.78}
                roughness={0.55}
                metalness={0.08}
                depthWrite={false}
              />
            </mesh>
            <mesh position={[0, 0, 0.003]}>
              <planeGeometry args={[0.7, 0.7]} />
              <meshBasicMaterial
                map={isHov ? textures[face.id].bright : textures[face.id].normal}
                transparent
                depthWrite={false}
              />
            </mesh>
          </group>
        )
      })}
    </>,
    cubeScene,
  )
}

