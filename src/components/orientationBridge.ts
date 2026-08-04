import { Quaternion, Vector3 } from 'three'

export interface CubeFaceDef {
  id: string
  label: string
  normal: Vector3
  title: string
}

export const ORIENTATION_FACES: CubeFaceDef[] = [
  { id: 'A', label: 'A', title: 'Anterior', normal: new Vector3(0, 0, 1) },
  { id: 'P', label: 'P', title: 'Posterior', normal: new Vector3(0, 0, -1) },
  { id: 'L', label: 'L', title: 'Left', normal: new Vector3(1, 0, 0) },
  { id: 'R', label: 'R', title: 'Right', normal: new Vector3(-1, 0, 0) },
  { id: 'H', label: 'H', title: 'Head', normal: new Vector3(0, 1, 0) },
  { id: 'B', label: 'B', title: 'Bottom', normal: new Vector3(0, -1, 0) },
]

/** Bridge: main Canvas writes quat; CSS cube reads it each animation frame. */
export const cameraBridge = {
  quat: new Quaternion(),
  pendingFaceId: null as string | null,
  requestFace(id: string) {
    this.pendingFaceId = id
  },
  /** Optional DOM node that receives rotate3d CSS. */
  cubeEl: null as HTMLDivElement | null,
}
