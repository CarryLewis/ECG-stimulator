export type HeartVersion = 'anatomy' | 'v1' | 'v2' | 'v3'

export const HEART_VERSIONS: readonly {
  id: HeartVersion
  short: string
  title: string
  hint: string
}[] = [
  {
    id: 'anatomy',
    short: 'Src',
    title: 'Source chambers',
    hint: 'Selectable RA/LA/RV/LV/septum/apex — biological source model',
  },
  {
    id: 'v1',
    short: 'V1',
    title: 'Conduction schematic',
    hint: 'Chambers + SA/AV + His–Purkinje tree',
  },
  {
    id: 'v2',
    short: 'V2',
    title: 'Lead atlas',
    hint: 'Wall territories and 12-lead pins',
  },
  {
    id: 'v3',
    short: 'V3',
    title: 'Torso electrodes',
    hint: 'Body contour and clinical electrode placement',
  },
] as const
