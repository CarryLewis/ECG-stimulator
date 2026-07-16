import type { Disease, ParamValues } from '../ecg/diseases'

interface ExplanationPanelProps {
  disease: Disease
  params: ParamValues
}

export default function ExplanationPanel({
  disease,
  params,
}: ExplanationPanelProps) {
  const ex = disease.explain(params)
  return (
    <div className="panel explanation-panel">
      <h2 className="panel-title">{disease.name}</h2>
      <p className="explanation-summary">{ex.summary}</p>

      <Section title="Why it changes (mechanism)" items={ex.mechanism} step />
      <Section title="What you see on the ECG" items={ex.ecgFindings} />
      <Section title="Clinical picture" items={ex.clinical} />
    </div>
  )
}

function Section({
  title,
  items,
  step,
}: {
  title: string
  items: string[]
  step?: boolean
}) {
  return (
    <div className="explanation-section">
      <h3 className="explanation-heading">{title}</h3>
      <ul className={'explanation-items' + (step ? ' explanation-items--step' : '')}>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  )
}
