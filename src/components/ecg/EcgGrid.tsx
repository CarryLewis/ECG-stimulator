import { useEffect, useRef, useState, type ReactNode } from 'react'
import { voltageSample } from '../../ecg/generator'
import { LEAD_GRID, LEAD_ORDER } from '../../ecg/leads'
import type { CyclePlan, LeadName } from '../../ecg/types'
import { useLanguage } from '../../i18n'
import EcgLeadLive from './EcgLead'

const FS = 250
const GRID_DURATION = 2.5
const STRIP_DURATION = 10
const GRID_CAPACITY = FS * GRID_DURATION
const STRIP_CAPACITY = FS * STRIP_DURATION

interface EcgGridProps {
  plan: CyclePlan
  elapsed: number
  focusLead: LeadName
  conductionDetails: ReactNode
  selectedLead: LeadName | null
  onSelectLead: (lead: LeadName | null) => void
}

function makeTrace(capacity: number) {
  return { samples: new Float32Array(capacity), count: 0 }
}

function append(trace: ReturnType<typeof makeTrace>, value: number) {
  if (trace.count < trace.samples.length) {
    trace.samples[trace.count++] = value
  } else {
    trace.samples.copyWithin(0, 1)
    trace.samples[trace.count - 1] = value
  }
}

/** Remount on scenario or parameter changes to keep old and new traces separate. */
export default function EcgGrid({
  plan,
  elapsed,
  focusLead,
  conductionDetails,
  selectedLead,
  onSelectLead,
}: EcgGridProps) {
  const { t } = useLanguage()
  const [traces] = useState(() => Object.fromEntries(
    LEAD_ORDER.map((lead) => [lead, makeTrace(GRID_CAPACITY)]),
  ) as Record<LeadName, ReturnType<typeof makeTrace>>)
  const [strip] = useState(() => makeTrace(STRIP_CAPACITY))
  const nextSample = useRef<number>()
  const [tick, setTick] = useState(0)
  const [showAllLeads, setShowAllLeads] = useState(() => window.matchMedia('(min-width: 1001px)').matches)

  useEffect(() => {
    const end = Math.floor(elapsed * FS)
    const start = Math.max(nextSample.current ?? 0, end - STRIP_CAPACITY + 1)
    if (start > end) return

    const ctx = { afSeed: plan.rhythmSeed || 23 }
    for (let index = start; index <= end; index++) {
      const time = index / FS
      if (index <= end - GRID_CAPACITY) {
        append(strip, voltageSample(plan, 'II', time, 0, ctx))
        continue
      }
      for (const lead of LEAD_ORDER) {
        const voltage = voltageSample(plan, lead, time, 0, ctx)
        append(traces[lead], voltage)
        if (lead === 'II') append(strip, voltage)
      }
    }
    nextSample.current = end + 1
    setTick((n) => n + 1)
  }, [elapsed, plan, strip, traces])

  const focus = selectedLead ?? focusLead

  return (
    <div className="ecg-grid-wrap">
      <div className="ecg-overview">
        <figure className="ecg-focus">
          <figcaption>
            <strong>{t('focusLead')} · {focus}</strong>
            <span>{t('calibration')}</span>
          </figcaption>
          <EcgLeadLive lead={focus} samples={traces[focus].samples}
            filled={traces[focus].count} duration={GRID_DURATION} tick={tick} showScale />
        </figure>
        {conductionDetails}
      </div>
      <details className="learning-details" open={showAllLeads}
        onToggle={(event) => setShowAllLeads(event.currentTarget.open)}>
        <summary>{t('ecgTitle')}</summary>
        <div className="ecg-grid">
          {LEAD_GRID.flat().map((lead) => (
            <button key={lead} className="ecg-cell" type="button"
              aria-label={`${t('focusLead')} ${lead}`}
              aria-pressed={selectedLead === lead}
              onClick={() => onSelectLead(selectedLead === lead ? null : lead)}>
              <EcgLeadLive lead={lead} samples={traces[lead].samples}
                filled={traces[lead].count} duration={GRID_DURATION} tick={tick} />
            </button>
          ))}
        </div>
        <figure className="ecg-strip">
          <figcaption>{t('rhythmStrip')}</figcaption>
          <EcgLeadLive lead="II" samples={strip.samples}
            filled={strip.count} duration={STRIP_DURATION} height={120} tick={tick} />
        </figure>
      </details>
    </div>
  )
}
