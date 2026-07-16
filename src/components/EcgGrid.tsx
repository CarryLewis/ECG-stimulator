import { LEAD_GRID } from '../ecg/leads'
import type { EcgResult, LeadName } from '../ecg/types'
import EcgLead from './EcgLead'

interface EcgGridProps {
  ecg: EcgResult
  strip: EcgResult
}

export default function EcgGrid({ ecg, strip }: EcgGridProps) {
  const byName = new Map(ecg.leads.map((l) => [l.name, l]))
  const stripLead = strip.leads.find((l) => l.name === 'II')

  const cell = (name: LeadName) => {
    const trace = byName.get(name)
    if (!trace) return <div key={name} className="ecg-cell" />
    return (
      <div key={name} className="ecg-cell">
        <EcgLead trace={trace} fs={ecg.fs} duration={ecg.duration} />
      </div>
    )
  }

  return (
    <div className="ecg-grid-wrap">
      <div className="ecg-grid">
        {LEAD_GRID.flatMap((row) => row.map((name) => cell(name)))}
      </div>
      {stripLead && (
        <div className="ecg-strip">
          <EcgLead
            trace={stripLead}
            fs={strip.fs}
            duration={strip.duration}
            height={120}
          />
        </div>
      )}
    </div>
  )
}
