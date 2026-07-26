import type { Disease, ParamValues } from '../ecg/diseases'
import {
  localizedDiseaseName,
  localizedExplain,
} from '../i18n/diseasesLocale'
import { useLanguage } from '../i18n/useLanguage'

interface ExplanationPanelProps {
  disease: Disease
  params: ParamValues
}

export default function ExplanationPanel({
  disease,
  params,
}: ExplanationPanelProps) {
  const { locale, t } = useLanguage()
  const ex = localizedExplain(disease.id, disease.explain, params, locale)
  const title = localizedDiseaseName(disease.id, disease.name, locale)

  return (
    <div className="panel explanation-panel">
      <h2 className="panel-title">{title}</h2>
      <p className="explanation-summary">{ex.summary}</p>

      <Section title={t('explainMechanism')} items={ex.mechanism} step />
      <Section title={t('explainEcg')} items={ex.ecgFindings} />
      <Section title={t('explainClinical')} items={ex.clinical} />
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
