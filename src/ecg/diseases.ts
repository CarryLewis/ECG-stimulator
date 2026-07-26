import type { CyclePlan, Territory } from './types'

export type ParamType = 'slider' | 'select'

export interface ParamOption {
  value: string
  label: string
}

export interface ParamDef {
  key: string
  label: string
  type: ParamType
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: ParamOption[]
  default: number | string
}

export type ParamValues = Record<string, number | string>

export interface Explanation {
  summary: string
  mechanism: string[]
  ecgFindings: string[]
  clinical: string[]
}

export type DiseaseCategory =
  | 'Baseline'
  | 'Cardiovascular'
  | 'Electrolyte'
  | 'Conduction'

export interface Disease {
  id: string
  name: string
  category: DiseaseCategory
  short: string
  params: ParamDef[]
  buildPlan: (v: ParamValues) => CyclePlan
  explain: (v: ParamValues) => Explanation
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

const num = (v: ParamValues, k: string, d: number): number => {
  const raw = v[k]
  return typeof raw === 'number' && !Number.isNaN(raw) ? raw : d
}

const str = (v: ParamValues, k: string, d: string): string => {
  const raw = v[k]
  return typeof raw === 'string' ? raw : d
}

function basePlan(rate: number): CyclePlan {
  return {
    ventricularRate: rate,
    atrialRate: rate,
    prInterval: 0.16,
    qrsWidthFactor: 1,
    pAmpFactor: 1,
    tAmpFactor: 1,
    tWidthFactor: 1,
    uAmp: 0,
    stGlobal: 0,
    stByTerritory: {},
    irregular: false,
    dissociated: false,
    fibrillatoryBaseline: false,
  }
}

const HR: ParamDef = {
  key: 'heartRate',
  label: 'Heart rate',
  type: 'slider',
  min: 40,
  max: 160,
  step: 1,
  unit: 'bpm',
  default: 72,
}

/** Territories that receive reciprocal ST depression for a given infarct site. */
const RECIPROCAL: Record<string, Territory[]> = {
  anterior: ['inferior'],
  inferior: ['lateral'],
  lateral: ['inferior'],
}

/** Territories that show ST elevation for a given infarct site. */
const INVOLVED: Record<string, Territory[]> = {
  anterior: ['anterior', 'septal'],
  inferior: ['inferior'],
  lateral: ['lateral'],
}

export const DISEASES: Disease[] = [
  {
    id: 'normal',
    name: 'Normal Sinus Rhythm',
    category: 'Baseline',
    short: 'Healthy baseline conduction and 12-lead morphology.',
    params: [{ ...HR, default: 72 }],
    buildPlan: (v) => basePlan(num(v, 'heartRate', 72)),
    explain: (v) => {
      const hr = num(v, 'heartRate', 72)
      return {
        summary: `Normal sinus rhythm at ${hr} bpm. The impulse starts in the SA node and follows the normal conduction pathway.`,
        mechanism: [
          'SA node depolarises spontaneously and sets the heart rate.',
          'The wavefront spreads across both atria (P wave).',
          'The AV node delays conduction (PR segment) so the atria can empty.',
          'The His–Purkinje system rapidly activates the ventricles (narrow QRS).',
          'Ventricular repolarisation produces the T wave.',
        ],
        ecgFindings: [
          'Upright P wave before every QRS (positive in II, negative in aVR).',
          'PR interval 120–200 ms, narrow QRS < 120 ms.',
          'Normal R-wave progression across V1→V6.',
        ],
        clinical: [
          'Asymptomatic — this is the reference state.',
          'Use it to compare against the disease patterns.',
        ],
      }
    },
  },
  {
    id: 'stemi',
    name: 'Acute MI (STEMI)',
    category: 'Cardiovascular',
    short: 'Coronary occlusion producing regional ST-segment elevation.',
    params: [
      { ...HR, default: 90 },
      {
        key: 'occlusion',
        label: 'Coronary occlusion',
        type: 'slider',
        min: 0,
        max: 100,
        step: 1,
        unit: '%',
        default: 80,
      },
      {
        key: 'territory',
        label: 'Infarct territory',
        type: 'select',
        default: 'anterior',
        options: [
          { value: 'anterior', label: 'Anterior (LAD) — V1–V4' },
          { value: 'inferior', label: 'Inferior (RCA) — II, III, aVF' },
          { value: 'lateral', label: 'Lateral (LCx) — I, aVL, V5, V6' },
        ],
      },
    ],
    buildPlan: (v) => {
      const plan = basePlan(num(v, 'heartRate', 90))
      const occ = clamp(num(v, 'occlusion', 80) / 100, 0, 1)
      const territory = str(v, 'territory', 'anterior')
      const elevation = 0.45 * occ
      const stByTerritory: Partial<Record<Territory, number>> = {}
      for (const terr of INVOLVED[territory] ?? []) {
        stByTerritory[terr] = elevation
      }
      for (const terr of RECIPROCAL[territory] ?? []) {
        stByTerritory[terr] = -0.5 * elevation
      }
      plan.stByTerritory = stByTerritory
      plan.tAmpFactor = 1 + 0.6 * occ
      return plan
    },
    explain: (v) => {
      const occ = num(v, 'occlusion', 80)
      const territory = str(v, 'territory', 'anterior')
      const label =
        territory === 'anterior'
          ? 'anterior wall (LAD)'
          : territory === 'inferior'
            ? 'inferior wall (RCA)'
            : 'lateral wall (LCx)'
      const leads =
        territory === 'anterior'
          ? 'V1–V4'
          : territory === 'inferior'
            ? 'II, III, aVF'
            : 'I, aVL, V5, V6'
      return {
        summary: `${occ}% occlusion of the artery supplying the ${label}. Transmural ischaemia produces an injury current and ST elevation in ${leads}.`,
        mechanism: [
          'Coronary occlusion cuts oxygen supply to the myocardium.',
          'ATP depletion disables Na⁺/K⁺ pumps → the injured cells cannot fully repolarise.',
          'A voltage difference (injury current) develops between healthy and injured tissue.',
          'During the ST segment this injury current lifts the baseline in leads facing the infarct.',
        ],
        ecgFindings: [
          `ST-segment elevation in ${leads}${occ >= 60 ? ' with hyperacute T waves' : ''}.`,
          'Reciprocal ST depression in the opposite leads.',
          occ >= 90
            ? 'Severe / near-complete occlusion — a time-critical STEMI.'
            : 'Partial occlusion — elevation scales with the degree of blockage.',
        ],
        clinical: [
          'Crushing chest pain, diaphoresis, nausea.',
          'Elevated troponin / cardiac biomarkers.',
          'Requires emergent reperfusion (PCI or thrombolysis).',
        ],
      }
    },
  },
  {
    id: 'hyperkalemia',
    name: 'Hyperkalemia',
    category: 'Electrolyte',
    short: 'High serum potassium slowing conduction and peaking T waves.',
    params: [
      { ...HR, default: 75 },
      {
        key: 'potassium',
        label: 'Serum potassium',
        type: 'slider',
        min: 4.0,
        max: 9.5,
        step: 0.1,
        unit: 'mmol/L',
        default: 4.2,
      },
    ],
    buildPlan: (v) => {
      const plan = basePlan(num(v, 'heartRate', 75))
      const k = num(v, 'potassium', 4.2)
      const tSev = clamp((k - 5.0) / 3.5, 0, 1)
      const wideSev = clamp((k - 6.5) / 2.5, 0, 1)
      const pSev = clamp((k - 6.5) / 1.5, 0, 1)
      plan.tAmpFactor = 1 + 1.9 * tSev
      plan.tWidthFactor = 1 - 0.55 * tSev
      plan.qrsWidthFactor = 1 + 1.4 * wideSev
      plan.pAmpFactor = 1 - pSev
      plan.prInterval = 0.16 + 0.07 * wideSev
      return plan
    },
    explain: (v) => {
      const k = num(v, 'potassium', 4.2)
      const stage =
        k < 5.5
          ? 'normal / borderline'
          : k < 6.5
            ? 'mild'
            : k < 7.5
              ? 'moderate'
              : 'severe'
      return {
        summary: `Serum K⁺ ${k.toFixed(1)} mmol/L (${stage}). Raised extracellular potassium reduces the K⁺ gradient and destabilises the resting membrane potential.`,
        mechanism: [
          'Higher extracellular K⁺ lowers the K⁺ concentration gradient.',
          'The resting membrane potential becomes less negative (partially depolarised).',
          'Sodium channels inactivate → slower depolarisation and conduction.',
          'Repolarisation is faster, producing tall, narrow (peaked) T waves.',
        ],
        ecgFindings: [
          k >= 5.5
            ? 'Tall, peaked, narrow-based T waves (earliest sign).'
            : 'T waves still normal at this level.',
          k >= 6.5 ? 'Widening QRS and prolonged PR interval.' : 'QRS still narrow.',
          k >= 7.5
            ? 'P waves flatten / disappear — approaching a sine-wave pattern.'
            : 'P waves still present.',
        ],
        clinical: [
          'Muscle weakness, paraesthesia, palpitations.',
          'Risk of ventricular fibrillation / asystole when severe.',
          'Treat with calcium (membrane stabiliser), insulin/glucose, and K⁺ removal.',
        ],
      }
    },
  },
  {
    id: 'hypokalemia',
    name: 'Hypokalemia',
    category: 'Electrolyte',
    short: 'Low serum potassium producing U waves and ST depression.',
    params: [
      { ...HR, default: 78 },
      {
        key: 'potassium',
        label: 'Serum potassium',
        type: 'slider',
        min: 1.5,
        max: 4.5,
        step: 0.1,
        unit: 'mmol/L',
        default: 4.0,
      },
    ],
    buildPlan: (v) => {
      const plan = basePlan(num(v, 'heartRate', 78))
      const k = num(v, 'potassium', 4.0)
      const sev = clamp((3.6 - k) / 2.1, 0, 1)
      plan.uAmp = 0.28 * sev
      plan.tAmpFactor = 1 - 0.7 * sev
      plan.stGlobal = -0.12 * sev
      return plan
    },
    explain: (v) => {
      const k = num(v, 'potassium', 4.0)
      const stage =
        k >= 3.5 ? 'normal' : k >= 3.0 ? 'mild' : k >= 2.5 ? 'moderate' : 'severe'
      return {
        summary: `Serum K⁺ ${k.toFixed(1)} mmol/L (${stage}). Low extracellular potassium prolongs repolarisation and unmasks the U wave.`,
        mechanism: [
          'Low extracellular K⁺ increases the K⁺ gradient across the membrane.',
          'Repolarising K⁺ currents are paradoxically reduced, prolonging repolarisation.',
          'The action potential lengthens and a prominent U wave follows the T wave.',
        ],
        ecgFindings: [
          k < 3.5 ? 'Flattened T waves.' : 'T waves normal at this level.',
          k < 3.5 ? 'Prominent U waves after the T wave.' : 'No U waves.',
          k < 3.0 ? 'ST-segment depression, long QU interval.' : 'ST segment normal.',
        ],
        clinical: [
          'Fatigue, muscle cramps, weakness.',
          'Risk of atrial and ventricular arrhythmias (including torsades).',
          'Replace potassium (and check magnesium).',
        ],
      }
    },
  },
  {
    id: 'afib',
    name: 'Atrial Fibrillation',
    category: 'Cardiovascular',
    short: 'Chaotic atrial activity with an irregularly irregular ventricular rate.',
    params: [
      {
        ...HR,
        label: 'Mean ventricular rate',
        min: 50,
        max: 180,
        default: 110,
      },
    ],
    buildPlan: (v) => {
      const plan = basePlan(num(v, 'heartRate', 110))
      plan.irregular = true
      plan.fibrillatoryBaseline = true
      plan.pAmpFactor = 0
      return plan
    },
    explain: (v) => {
      const hr = num(v, 'heartRate', 110)
      return {
        summary: `Atrial fibrillation with a mean ventricular response of ~${hr} bpm. Multiple re-entrant wavelets replace organised atrial activity.`,
        mechanism: [
          'Disorganised electrical wavelets circulate continuously through the atria.',
          'There is no single coordinated atrial depolarisation, so no P wave forms.',
          'The AV node is bombarded and conducts impulses erratically.',
          'This produces an irregularly irregular ventricular rhythm.',
        ],
        ecgFindings: [
          'No discernible P waves — a fibrillatory (chaotic) baseline instead.',
          'Irregularly irregular R–R intervals.',
          'QRS complexes remain narrow (normal ventricular conduction).',
        ],
        clinical: [
          'Palpitations, breathlessness, or may be asymptomatic.',
          'Stasis in the atria raises stroke risk → anticoagulation.',
          'Manage with rate or rhythm control.',
        ],
      }
    },
  },
  {
    id: 'heart_block',
    name: 'AV Conduction Block',
    category: 'Conduction',
    short: 'Delayed or failed conduction between the atria and ventricles.',
    params: [
      { ...HR, default: 75 },
      {
        key: 'degree',
        label: 'Block degree',
        type: 'select',
        default: 'first',
        options: [
          { value: 'first', label: 'First-degree (prolonged PR)' },
          { value: 'third', label: 'Third-degree (complete)' },
        ],
      },
      {
        key: 'pr',
        label: 'PR interval (1st degree)',
        type: 'slider',
        min: 0.2,
        max: 0.42,
        step: 0.01,
        unit: 's',
        default: 0.28,
      },
    ],
    buildPlan: (v) => {
      const degree = str(v, 'degree', 'first')
      if (degree === 'third') {
        const plan = basePlan(38)
        plan.atrialRate = num(v, 'heartRate', 75)
        plan.ventricularRate = 38
        plan.dissociated = true
        plan.qrsWidthFactor = 1.7
        return plan
      }
      const plan = basePlan(num(v, 'heartRate', 75))
      plan.prInterval = num(v, 'pr', 0.28)
      return plan
    },
    explain: (v) => {
      const degree = str(v, 'degree', 'first')
      if (degree === 'third') {
        return {
          summary:
            'Third-degree (complete) AV block. No atrial impulses reach the ventricles; a slow ventricular escape rhythm takes over independently.',
          mechanism: [
            'The AV node / His–Purkinje conduction is completely interrupted.',
            'The atria continue firing from the SA node at their own rate.',
            'A subsidiary pacemaker below the block drives the ventricles slowly.',
            'Atria and ventricles are therefore fully dissociated.',
          ],
          ecgFindings: [
            'P waves and QRS complexes march out independently (AV dissociation).',
            'Atrial rate faster than the slow ventricular escape rate.',
            'Wide QRS if the escape focus is ventricular.',
          ],
          clinical: [
            'Syncope, fatigue, hypotension, heart failure.',
            'Often requires a permanent pacemaker.',
          ],
        }
      }
      const pr = num(v, 'pr', 0.28)
      return {
        summary: `First-degree AV block — every P wave conducts, but the PR interval is prolonged to ${Math.round(
          pr * 1000,
        )} ms.`,
        mechanism: [
          'Conduction through the AV node is slowed but not interrupted.',
          'Each atrial impulse still reaches the ventricles, just later.',
        ],
        ecgFindings: [
          `Fixed, prolonged PR interval (> 200 ms; here ${Math.round(pr * 1000)} ms).`,
          '1:1 relationship — every P is followed by a QRS.',
          'Narrow QRS with normal ventricular activation.',
        ],
        clinical: [
          'Usually asymptomatic and benign.',
          'May be caused by AV-nodal blocking drugs or increased vagal tone.',
        ],
      }
    },
  },
]

export const DISEASE_BY_ID: Record<string, Disease> = Object.fromEntries(
  DISEASES.map((d) => [d.id, d]),
)

export function defaultParams(disease: Disease): ParamValues {
  const v: ParamValues = {}
  for (const p of disease.params) v[p.key] = p.default
  return v
}
