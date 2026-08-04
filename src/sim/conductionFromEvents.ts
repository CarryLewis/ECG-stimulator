import type { ConductionState } from '../ecg/types'
import type { HeartbeatCycle, PhysiologicalEvent } from './events'
import { SINUS_WIDTH_S } from './sinusTiming'

function gauss(x: number, center: number, width: number): number {
  const d = x - center
  return Math.exp(-(d * d) / (2 * width * width))
}

function eventAt(
  events: readonly PhysiologicalEvent[],
  type: PhysiologicalEvent['type'],
): PhysiologicalEvent | undefined {
  return events.find((e) => e.type === type)
}

/**
 * Sample conduction glow intensities from scheduled physiological events.
 *
 * This is the only path from simulation time → visual activation.
 * No CSS keyframes / ad-hoc phase machines in the view layer.
 */
export function conductionStateFromEvents(
  t: number,
  beat: HeartbeatCycle,
): ConductionState {
  const ev = beat.events
  const saEv = eventAt(ev, 'sa_node_activation')
  const atrEv = eventAt(ev, 'atrial_activation')
  const avEv = eventAt(ev, 'av_node_activation')
  const hisEv = eventAt(ev, 'his_activation')
  const bunEv = eventAt(ev, 'bundle_branch_activation')
  const ventEv = eventAt(ev, 'ventricular_activation')
  const repEv = eventAt(ev, 'repolarization')

  const sa = saEv ? gauss(t, saEv.t, SINUS_WIDTH_S.sa) : 0
  const atria = atrEv ? gauss(t, atrEv.t, SINUS_WIDTH_S.atrial) : 0
  const av = avEv ? gauss(t, avEv.t, SINUS_WIDTH_S.av) : 0
  const his = hisEv ? gauss(t, hisEv.t, SINUS_WIDTH_S.his) : 0
  const bundle = bunEv ? gauss(t, bunEv.t, SINUS_WIDTH_S.bundle) : 0
  const ventricle = ventEv
    ? gauss(t, ventEv.t, SINUS_WIDTH_S.ventricle)
    : 0
  const repol = repEv ? gauss(t, repEv.t, SINUS_WIDTH_S.repol) : 0

  const active = activeEventLabel(t, beat)
  const phaseMs = Math.round((t - beat.t0) * 1000)

  return {
    sa,
    atria,
    av,
    his,
    bundle,
    ventricle,
    avConducts: true,
    status: `t⁺${phaseMs} ms · ${active}`,
    repol,
  }
}

/** Highest-intensity teaching event at time t (for HUD). */
export function activeEventLabel(t: number, beat: HeartbeatCycle): string {
  const scored = beat.events
    .filter((e) => e.type !== 'cycle_start' && e.type !== 'cycle_end')
    .map((e) => {
      const w =
        e.type === 'sa_node_activation'
          ? SINUS_WIDTH_S.sa
          : e.type === 'atrial_activation'
            ? SINUS_WIDTH_S.atrial
            : e.type === 'av_node_activation'
              ? SINUS_WIDTH_S.av
              : e.type === 'his_activation'
                ? SINUS_WIDTH_S.his
                : e.type === 'bundle_branch_activation'
                  ? SINUS_WIDTH_S.bundle
                  : e.type === 'ventricular_activation'
                    ? SINUS_WIDTH_S.purkinje
                    : SINUS_WIDTH_S.repol
      return { e, score: gauss(t, e.t, w) }
    })
    .sort((a, b) => b.score - a.score)

  const top = scored[0]
  if (!top || top.score < 0.12) return 'Diastole / resting'
  return top.e.label
}

export function activeEvent(
  t: number,
  beat: HeartbeatCycle,
): PhysiologicalEvent | null {
  const scored = beat.events
    .filter((e) => e.type !== 'cycle_start' && e.type !== 'cycle_end')
    .map((e) => ({
      e,
      score: gauss(t, e.t, 0.04),
    }))
    .sort((a, b) => b.score - a.score)
  const top = scored[0]
  return top && top.score >= 0.12 ? top.e : null
}
