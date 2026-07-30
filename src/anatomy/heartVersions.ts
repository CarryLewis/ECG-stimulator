export type HeartVersion = 'anatomy' | 'v1' | 'v2' | 'v3' | 'vector'

export const HEART_VERSIONS: readonly {
  id: HeartVersion
  short: string
  title: string
  hint: string
}[] = [
  {
    id: 'anatomy',
    short: 'Anatomy',
    title: 'Anatomy',
    hint: 'Selectable chambers — biological source model',
  },
  {
    id: 'v1',
    short: 'Conduction',
    title: 'Conduction',
    hint: 'SA/AV + His–Purkinje activation pathway',
  },
  {
    id: 'v2',
    short: 'Leads',
    title: 'Leads',
    hint: 'Wall territories and 12-lead viewing angles',
  },
  {
    id: 'v3',
    short: 'Torso',
    title: 'Torso',
    hint: 'Clinical electrode placement on the body surface',
  },
  {
    id: 'vector',
    short: 'Vectors',
    title: 'Vectors',
    hint: 'Myocardial vectors, mean axis, and field direction',
  },
] as const
