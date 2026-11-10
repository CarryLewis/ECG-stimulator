import type { ConductionState, CyclePlan } from '../../ecg/types'
import { useLanguage } from '../../i18n'

interface ConductionTimelineProps {
  plan: CyclePlan
  state: ConductionState
  intermittentBlock: boolean
}

/** Teach only the pathway supported by the current simulation state. */
export default function ConductionTimeline({
  plan,
  state,
  intermittentBlock,
}: ConductionTimelineProps) {
  const { t, L } = useLanguage()
  const ventricularArrhythmia = plan.ventricularFibrillation || plan.ventricularFlutter
  const showDissociation = plan.dissociated && !ventricularArrhythmia
  const showPathway = !ventricularArrhythmia && !showDissociation
    && !plan.fibrillatoryBaseline && !plan.flutterBaseline && !intermittentBlock
  const steps = [
    [t('stepSa'), state.sa],
    [t('stepAtrial'), state.atria],
    [t('stepAv'), state.av],
    [t('stepHis'), state.his],
    [t('stepBundle'), state.bundle],
    [t('stepPurkinje'), state.ventricle],
    [t('stepRepol'), state.repol],
  ] as const

  return (
    <details className="learning-details conduction-details" open>
      <summary>{t('conductionCascade')}</summary>
      {showPathway && (
        <>
          <ol className="conduction-pathway">
            {steps.map(([label, activity]) => (
              <li key={label} className={activity >= 0.35 ? 'conduction-pathway-step--live' : ''}>
                {label}
              </li>
            ))}
          </ol>
          <p>{t('prInterval')} · {Math.round(plan.prInterval * 1000)} ms</p>
        </>
      )}
      {showDissociation && (
        <div className="activation-tracks">
          <p>{t('simulatedActivity')}</p>
          <label>
            <span>{t('atria')} · {Math.round(plan.atrialRate)} bpm</span>
            <meter min={0} max={1} value={Math.max(state.sa, state.atria)} />
          </label>
          <label>
            <span>{t('ventricles')} · {Math.round(plan.ventricularRate)} bpm</span>
            <meter min={0} max={1} value={state.ventricle} />
          </label>
        </div>
      )}
      {!showPathway && <p>{intermittentBlock ? t('interruptedPathway') : L(state.status)}</p>}
    </details>
  )
}
