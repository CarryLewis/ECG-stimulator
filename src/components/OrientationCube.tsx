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
  Vector4,
} from 'three'

/**
 * Medical-imaging orientation cube — CT/MRI viewer style.
 *
 * Important (R3F): any useFrame with priority > 0 disables the automatic
 * default-scene render. We therefore re-render the main scene ourselves,
 * then draw this cube into a scissored corner inset (same pattern as drei Hud).
 *
 * Labels (body axes: +x left, +y superior, +z anterior):
 *   A = Anterior (+z)  P = Posterior (−z)
 *   L = Left (+x)      R = Right (−x)
 *   H = Head (+y)      B = Bottom (−y)
 */

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
  { id: 'B', label: 'B', normal: new Vector3(0, -1, 0), rotation: [Math.PI / 2, 0, 0],      position: [0, -S, 0], baseColor: '#3d1a1a', hoverColor: '#6a3535' },
]

const _q = new Quaternion()
const _v = new Vector3()
const _m = new Matrix4()
const _ray = new Raycaster()
const _ndc = new Vector2()
const _viewport = new Vector4()
const _scissor = new Vector4()

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

export default function OrientationCube({ size = 105 }: { size?: number }) {
  const {
    camera: mainCamera,
    gl,
    size: canvasSize,
    scene: mainScene,
  } = useThree()
  const cubeScene = useMemo(() => new Scene(), [])
  const cubeCam = useRef<OrthographicCamera | null>(null)
  const boxGeo = useMemo(() => new BoxGeometry(1, 1, 1), [])
  const faceMeshes = useRef<Record<string, Mesh>>({})
  const [hovered, setHovered] = useState<string | null>(null)

  const animRef = useRef({
    targetQuat: new Quaternion(),
    targetPos: new Vector3(),
    active: false,
  })

  useEffect(() => {
    const cam = new OrthographicCamera(-1.2, 1.2, 1.2, -1.2, 0.1, 20)
    cam.position.set(0, 0, 4)
    cam.lookAt(0, 0, 0)
    cubeCam.current = cam
  }, [])

  useEffect(
    () => () => {
      boxGeo.dispose()
    },
    [boxGeo],
  )

  const textures = useMemo(() => {
    const map: Record<string, { normal: CanvasTexture; bright: CanvasTexture }> =
      {}
    for (const f of FACES) {
      map[f.id] = {
        normal: makeLabelTex(f.label, false),
        bright: makeLabelTex(f.label, true),
      }
    }
    return map
  }, [])

  const vp = useMemo(() => {
    const dpr = gl.getPixelRatio()
    const w = Math.round(canvasSize.width * dpr)
    const h = Math.round(canvasSize.height * dpr)
    const s = Math.round(size * dpr)
    return { x: w - s - 4, y: h - s - 4, w: s, h: s }
  }, [canvasSize, gl, size])

  const cssRect = useMemo(
    () => ({
      left: canvasSize.width - size - 4 / gl.getPixelRatio(),
      top: 4 / gl.getPixelRatio(),
      size,
    }),
    [canvasSize, gl, size],
  )

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

  useEffect(() => {
    const canvas = gl.domElement

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const face = hitTest(x, y)
      setHovered(face ? face.id : null)
      canvas.style.cursor =
        face && x >= cssRect.left && y <= cssRect.size + 4 ? 'pointer' : ''
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

  // Priority > 0 → R3F will NOT auto-render the default scene.
  useFrame(() => {
    const cam = cubeCam.current
    if (!cam) return

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

    mainCamera.getWorldQuaternion(_q)
    cam.quaternion.copy(_q)
    _v.set(0, 0, 4).applyQuaternion(_q)
    cam.position.copy(_v)
    cam.updateMatrixWorld()

    const prevAutoClear = gl.autoClear
    gl.getViewport(_viewport)
    gl.getScissor(_scissor)
    const prevScissorTest = gl.getScissorTest()

    // 1) Draw the real scene (heart / torso) — required because priority > 0.
    gl.autoClear = true
    gl.setScissorTest(false)
    gl.setViewport(0, 0, canvasSize.width * gl.getPixelRatio(), canvasSize.height * gl.getPixelRatio())
    gl.render(mainScene, mainCamera)

    // 2) Inset orientation cube (scissored corner).
    gl.autoClear = false
    gl.setScissorTest(true)
    gl.setViewport(vp.x, vp.y, vp.w, vp.h)
    gl.setScissor(vp.x, vp.y, vp.w, vp.h)
    gl.clear(true, true, true)
    gl.render(cubeScene, cam)

    // Restore GL state for the next frame / other subscribers.
    gl.setViewport(_viewport.x, _viewport.y, _viewport.z, _viewport.w)
    gl.setScissor(_scissor.x, _scissor.y, _scissor.z, _scissor.w)
    gl.setScissorTest(prevScissorTest)
    gl.autoClear = prevAutoClear
  }, 1)

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
        <edgesGeometry args={[boxGeo]} />
        <lineBasicMaterial color="#8aa0bb" transparent opacity={0.5} />
      </lineSegments>

      {FACES.map((face) => {
        const isHov = hovered === face.id
        return (
          <group key={face.id} position={face.position} rotation={face.rotation}>
            <mesh ref={setFaceMeshRef(face.id)}>
              <planeGeometry args={[0.96, 0.96]} />
              <meshBasicMaterial
                color={isHov ? face.hoverColor : face.baseColor}
                transparent
                opacity={isHov ? 0.95 : 0.85}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, 0, 0.003]}>
              <planeGeometry args={[0.7, 0.7]} />
              <meshBasicMaterial
                map={isHov ? textures[face.id].bright : textures[face.id].normal}
                transparent
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
        )
      })}
    </>,
    cubeScene,
  )
}
