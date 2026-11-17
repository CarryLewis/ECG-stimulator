import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeVertices } from 'three-stdlib'

/** Camera-dependent contour lines; selection never fills or brightens the tissue. */
export default function SourceSelectionOutline({ geometry }: { geometry: THREE.BufferGeometry }) {
  const contour = useMemo(() => {
    const source = geometry.clone()
    source.deleteAttribute('normal')
    const merged = mergeVertices(source)
    source.dispose()
    const position = merged.getAttribute('position')
    const index = merged.index!
    const faces: { normal: THREE.Vector3; point: THREE.Vector3 }[] = []
    const edges = new Map<string, { a: THREE.Vector3; b: THREE.Vector3; faces: number[] }>()
    for (let i = 0; i < index.count; i += 3) {
      const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)]
      const vertices = ids.map(id => new THREE.Vector3().fromBufferAttribute(position, id))
      const normal = vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0]))
      if (normal.lengthSq() < 1e-14) continue
      const face = faces.length
      faces.push({ normal: normal.normalize(), point: vertices[0] })
      for (let j = 0; j < 3; j++) {
        const k = (j + 1) % 3
        const key = [ids[j], ids[k]].sort((a, b) => a - b).join(':')
        const edge = edges.get(key)
        if (edge) edge.faces.push(face)
        else edges.set(key, { a: vertices[j], b: vertices[k], faces: [face] })
      }
    }
    merged.dispose()
    const segments = new Float32Array(edges.size * 6)
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(segments, 3).setUsage(THREE.DynamicDrawUsage))
    lineGeometry.setDrawRange(0, 0)
    return { edges: [...edges.values()], faces, segments, lineGeometry }
  }, [geometry])
  useEffect(() => () => contour.lineGeometry.dispose(), [contour])
  const lastCamera = useRef(new THREE.Vector3(Infinity, Infinity, Infinity))
  const direction = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera }) => {
    if (lastCamera.current.distanceToSquared(camera.position) < 1e-10) return
    lastCamera.current.copy(camera.position)
    const facing = contour.faces.map(face => face.normal.dot(direction.copy(camera.position).sub(face.point)) >= 0)
    let count = 0
    for (const edge of contour.edges) {
      if (edge.faces.length > 1 && edge.faces.every(f => facing[f] === facing[edge.faces[0]])) continue
      edge.a.toArray(contour.segments, count * 6)
      edge.b.toArray(contour.segments, count * 6 + 3)
      count++
    }
    contour.lineGeometry.getAttribute('position').needsUpdate = true
    contour.lineGeometry.setDrawRange(0, count * 2)
  })
  return <lineSegments geometry={contour.lineGeometry} frustumCulled={false} raycast={() => null} renderOrder={4}>
    <lineBasicMaterial color="#b7f4e9" transparent opacity={0.9} depthWrite={false} />
  </lineSegments>
}
