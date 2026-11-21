import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'
import type { OrbitControls } from 'three-stdlib'

/** Fit only the source model, reserving room for the existing HUD and view controls. */
export default function SourceFraming() {
  const { camera, controls, size, invalidate } = useThree()
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    const narrow = size.width <= 900
    const leftReserve = size.width >= 1000 ? 320 : 230
    const usableHeight = Math.max(150, size.height - (size.width <= 360 ? 338 : narrow ? 288 : 124))
    const usableWidth = Math.max(140, size.width - (narrow ? 164 : leftReserve + 360))
    const pixelsPerUnit = Math.min(usableHeight / 2.75, usableWidth / 1.9)
    const distance = size.height / (2 * Math.tan(camera.fov * Math.PI / 360) * pixelsPerUnit)
    const centerX = narrow ? size.width * 0.5 : (leftReserve + size.width - 190) / 2
    const centerY = narrow ? (size.height + (size.width <= 360 ? 128 : 78)) / 2 : size.height * 0.5
    const orbit = controls as OrbitControls | null
    orbit?.target.set(0, 0.1, 0)
    camera.position.set(0.2, 0.3, distance)
    camera.lookAt(0, 0.1, 0)
    orbit?.update()
    camera.setViewOffset(size.width, size.height, size.width / 2 - centerX, size.height / 2 - centerY, size.width, size.height)
    camera.updateProjectionMatrix()
    invalidate()
    return () => { camera.clearViewOffset() }
  }, [camera, controls, size.width, size.height, invalidate])
  return null
}
