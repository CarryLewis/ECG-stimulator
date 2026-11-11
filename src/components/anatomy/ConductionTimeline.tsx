import type { CyclePlan, ConductionState } from '../../ecg/types'
import type { PhysiologicalEvent } from '../../sim/events'
import { SINUS_OFFSET_S } from '../../sim/sinusTiming'
import {
  useLanguage,
  type LocalizedString,
  type UiMessageKey,
} from '../../i18n'

const PATHWAY: {
  key: string
  offsetMs: number
  labelKey: UiMessageKey
  match: PhysiologicalEvent['type']
}[] = [
  {
    key: 'sa',
    offsetMs: SINUS_OFFSET_S.sa * 1000,
    labelKey: 'stepSa',
    match: 'sa_node_activation',
  },
  {
    key: 'atrial',
    offsetMs: SINUS_OFFSET_S.atrial * 1000,
    labelKey: 'stepAtrial',
    match: 'atrial_activation',
  },
  {
    key: 'av',
    offsetMs: SINUS_OFFSET_S.av * 1000,
    labelKey: 'stepAv',
    match: 'av_node_activation',
  },
  {
    key: 'his',
    offsetMs: SINUS_OFFSET_S.his * 1000,
    labelKey: 'stepHis',
    match: 'his_activation',
  },
  {
    key: 'bundle',
    offsetMs: SINUS_OFFSET_S.bundle * 1000,
    labelKey: 'stepBundle',
    match: 'bundle_branch_activation',
  },
  {
    key: 'purkinje',
    offsetMs: SINUS_OFFSET_S.purkinje * 1000,
    labelKey: 'stepPurkinje',
    match: 'ventricular_activation',
  },
  {
    key: 'repol',
    offsetMs: SINUS_OFFSET_S.repolarization * 1000,
    labelKey: 'stepRepol',
    match: 'repolarization',
  },
]

interface ConductionTimelineProps {
  phaseMs: number
  active: PhysiologicalEvent | null
  status: LocalizedString | string
  elapsed: number
  timeScale: number
  rateBpm: number
  plan: CyclePlan
  state: ConductionState
}

/**
 * Teaching HUD — lights each pathway step from the active physiological event.
 */
export default function ConductionTimeline({
  phaseMs,
  active,
  status,
  elapsed,
  timeScale,
  rateBpm,
  plan,
  state,
}: ConductionTimelineProps) {
  const { t, L, locale } = useLanguage()
  const statusText =
    typeof status === 'string'
      ? status
      : L(status)

  const unorganized = plan.ventricularFibrillation || plan.ventricularFlutter
    || plan.fibrillatoryBaseline || plan.flutterBaseline || plan.irregular
  const independent = plan.dissociated && !unorganized

  return (
    <div className="conduction-timeline">
      <div className="conduction-timeline-head">
        <strong>{t('conductionCascade')}</strong>
        <span className="conduction-timeline-meta">
          t = {elapsed.toFixed(2)} s · ×{timeScale.toFixed(2)} ·{' '}
          {plan.ventricularFibrillation ? t('rateNotMeasurable') : `${rateBpm} bpm`}
          {!unorganized && !independent && <> · {t('phase')} {phaseMs} ms</>}
        </span>
      </div>
      {!unorganized && !independent && (
        <ol className="conduction-pathway">
          {PATHWAY.map((step, i) => {
            const live = active?.type === step.match
            const passed = phaseMs >= step.offsetMs - 5
            return (
              <li
                key={step.key}
                className={
                  'conduction-pathway-step' +
                  (live ? ' conduction-pathway-step--live' : '') +
                  (passed && !live ? ' conduction-pathway-step--passed' : '')
                }
              >
                {i > 0 && <span className="conduction-pathway-arrow" aria-hidden />}
                <span className="conduction-pathway-ms">{step.offsetMs} ms</span>
                <span className="conduction-pathway-label">{t(step.labelKey)}</span>
              </li>
            )
          })}
        </ol>
      )}
      {independent && (
        <div className="conduction-timeline-status">
          <label>{t('atrialActivity')} · {Math.round(plan.atrialRate)} bpm
            <meter min={0} max={1} value={Math.max(state.sa, state.atria)} />
          </label>
          <br />
          <label>{t('ventricularActivity')} · {Math.round(plan.ventricularRate)} bpm
            <meter min={0} max={1} value={state.ventricle} />
          </label>
        </div>
      )}
      <p className="conduction-timeline-status" lang={locale} role="status">
        {statusText}
      </p>
    </div>
  )
}
