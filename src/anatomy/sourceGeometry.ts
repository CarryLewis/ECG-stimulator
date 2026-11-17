import * as THREE from 'three'
import type { HeartStructureId } from './types'

/** Teaching geometry in patient axes. These surfaces do not alter the ECG solver. */
export const SOURCE_ANCHORS: Record<HeartStructureId, [number, number, number]> = {
  right_atrium: [-0.54, 0.69, 0.13],
  left_atrium: [0.4, 0.72, -0.22],
  right_ventricle: [-0.48, -0.18, 0.43],
  left_ventricle: [0.61, -0.3, 0.22],
  septum: [-0.05, -0.18, 0.07],
  apex: [0.25, -1.13, 0.04],
}

function surfacePoint(id: HeartStructureId, v: number, u: number, inner: boolean) {
  const a = u * Math.PI * 2
  const r = Math.sin(Math.PI * v)
  const wall = inner ? 0.74 : 1
  if (id === 'left_ventricle') {
    // One tapered ventricular surface continues into the apex.
    const profile = Math.pow(r, 0.8) * (0.7 + v * 0.3)
    return new THREE.Vector3(
      0.25 + profile * 0.59 * Math.cos(a) * wall,
      -1.14 + v * 1.78 * (inner ? 0.9 : 1) + (inner ? 0.1 : 0),
      -0.05 + profile * 0.47 * Math.sin(a) * wall,
    )
  }
  if (id === 'right_ventricle') {
    // Thin anterior crescent, meeting the LV along its medial edge.
    const profile = Math.pow(r, 0.78)
    const theta = -0.15 + u * Math.PI * 1.12
    const outer = 0.65 + 0.1 * Math.sin(Math.PI * u)
    const rad = inner ? outer - 0.1 : outer
    return new THREE.Vector3(
      0.07 - profile * rad * Math.sin(theta),
      -0.98 + v * 1.58,
      -0.03 + profile * rad * 0.68 * Math.cos(theta),
    )
  }
  if (id === 'septum') {
    return new THREE.Vector3(
      -0.09 + Math.sin(a) * r * 0.075,
      -0.3 + Math.cos(Math.PI * v) * 0.64,
      -0.01 + Math.cos(a) * r * 0.34,
    )
  }
  const left = id === 'left_atrium'
  const shape = 1 + 0.065 * Math.cos(3 * a) * r
  return new THREE.Vector3(
    (left ? 0.35 : -0.48) + Math.cos(a) * r * (left ? 0.32 : 0.34) * shape,
    (left ? 0.66 : 0.63) + Math.cos(Math.PI * v) * 0.32,
    (left ? -0.23 : 0.04) + Math.sin(a) * r * 0.27 * shape,
  )
}

/** Ventricular cutaway includes an inner wall and connected cut edges. */
export function createSourceGeometry(id: HeartStructureId, cutaway = false) {
  const rows = 40
  const columns = 64
  const cut = cutaway && (id === 'left_ventricle' || id === 'right_ventricle')
  const layers = cut ? 2 : 1
  const positions: number[] = []
  const indices: number[] = []
  const stride = columns + 1
  const layerSize = (rows + 1) * stride
  for (let layer = 0; layer < layers; layer++) {
    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= columns; x++) {
        const u = cut ? (id === 'left_ventricle'
          ? 0.42 + (x / columns) * 0.66
          : 0.28 + (x / columns) * 0.72) : x / columns
        const p = surfacePoint(id, y / rows, u, layer === 1)
        positions.push(p.x, p.y, p.z)
      }
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const a = layer * layerSize + y * stride + x
        const b = a + stride
        const reverse = (id.includes('ventricle') || id === 'septum') !== (layer === 1)
        if (reverse) indices.push(a, b, a + 1, a + 1, b, b + 1)
        else indices.push(a, a + 1, b, a + 1, b + 1, b)
      }
    }
  }
  if (!cut && id === 'right_ventricle') {
    for (let y = 0; y < rows; y++) {
      const a = y * stride
      indices.push(a, a + columns, a + stride, a + columns, a + stride + columns, a + stride)
    }
  }
  if (cut) {
    for (const edge of [0, columns]) {
      for (let y = 0; y < rows; y++) {
        const a = y * stride + edge
        const b = a + stride
        const c = a + layerSize
        const d = b + layerSize
        indices.push(a, b, c, b, d, c)
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}
