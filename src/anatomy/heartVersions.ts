export type HeartVersion = 'anatomy' | 'anatomy-v1' | 'v1' | 'v2' | 'v3'

/** Stable model links keep source-model versions separate from the app's 2.0 release. */
export function heartVersionFromSearch(search: string): HeartVersion {
  const view = new URLSearchParams(search).get('view')
  if (view === 'source-2') return 'anatomy'
  if (view === 'source-1') return 'anatomy-v1'
  if (view === 'v2' || view === 'v3') return view
  return 'v1'
}

export const HEART_VERSIONS: readonly {
  id: HeartVersion
  short: string
  title: string
  hint: string
}[] = [
  {
    id: 'anatomy',
    short: 'Source 2.0',
    title: 'Source 2.0 — cardiac anatomy',
    hint: 'Continuous ventricular geometry, readable labels and a septal cutaway',
  },
  {
    id: 'anatomy-v1',
    short: 'Source 1.0',
    title: 'Source 1.0 — original model',
    hint: 'Preserved original chamber geometry and interaction',
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
