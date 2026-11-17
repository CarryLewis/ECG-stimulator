import assert from 'node:assert/strict'
import { createSourceGeometry, SOURCE_ANCHORS } from '../src/anatomy/sourceGeometry.ts'

// A missing cut edge or inverted shell may compile correctly but disappear on rotation.
function inspect(id, cutaway) {
  const geometry = createSourceGeometry(id, cutaway)
  const p = geometry.getAttribute('position')
  assert.ok([...p.array].every(Number.isFinite), `${id}: finite positions`)
  assert.ok([...geometry.getAttribute('normal').array].every(Number.isFinite), `${id}: finite normals`)
  const index = geometry.index
  const vertices = new Map(), ids = [], edges = new Map()
  for (let i = 0; i < p.count; i++) {
    const key = [p.getX(i), p.getY(i), p.getZ(i)].map(x => Math.round(x * 1e5)).join(',')
    if (!vertices.has(key)) vertices.set(key, vertices.size)
    ids.push(vertices.get(key))
  }
  let volume = 0
  for (let i = 0; i < index.count; i += 3) {
    const triangle = [index.getX(i), index.getX(i + 1), index.getX(i + 2)]
    const merged = triangle.map(i => ids[i])
    if (new Set(merged).size < 3) continue
    const [a, b, c] = triangle.map(i => [p.getX(i), p.getY(i), p.getZ(i)])
    volume += (a[0] * (b[1] * c[2] - b[2] * c[1]) + a[1] * (b[2] * c[0] - b[0] * c[2]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6
    for (let j = 0; j < 3; j++) {
      const key = [merged[j], merged[(j + 1) % 3]].sort((a, b) => a - b).join(',')
      edges.set(key, (edges.get(key) ?? 0) + 1)
    }
  }
  assert.ok([...edges.values()].every(count => count === 2), `${id}: closed manifold, including cut edges`)
  assert.ok(volume > 0, `${id}: outward winding`)
  geometry.computeBoundingBox()
  if (id === 'left_ventricle') {
    assert.ok(Math.abs(geometry.boundingBox.min.y - SOURCE_ANCHORS.apex[1]) < 0.03, 'apex belongs to the LV surface')
  }
  geometry.dispose()
  return volume
}
for (const id of ['right_atrium', 'left_atrium', 'right_ventricle', 'left_ventricle', 'septum']) {
  const closedVolume = inspect(id, false)
  if (id.includes('ventricle')) assert.ok(inspect(id, true) < closedVolume * 0.6, `${id}: cutaway reveals a cavity`)
  console.log(`PASS ${id}: finite, closed, outward-facing geometry`)
}
