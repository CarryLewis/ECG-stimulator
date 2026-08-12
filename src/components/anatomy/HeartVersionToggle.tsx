import {
  HEART_VERSIONS,
  type HeartVersion,
} from '../../anatomy/heartVersions'
import { useLanguage } from '../../i18n'

const VERSION_COPY = {
  anatomy: {
    short: 'versionAnatomyShort',
    title: 'versionAnatomyTitle',
    hint: 'versionAnatomyHint',
  },
  v1: {
    short: 'versionV1Short',
    title: 'versionV1Title',
    hint: 'versionV1Hint',
  },
  v2: {
    short: 'versionV2Short',
    title: 'versionV2Title',
    hint: 'versionV2Hint',
  },
  v3: {
    short: 'versionV3Short',
    title: 'versionV3Title',
    hint: 'versionV3Hint',
  },
} as const

interface HeartVersionToggleProps {
  heartVersion: HeartVersion
  onHeartVersionChange: (v: HeartVersion) => void
}

/** Src / V1 / V2 / V3 switcher — lives on the 3D viewport top-right bar. */
export default function HeartVersionToggle({
  heartVersion,
  onHeartVersionChange,
}: HeartVersionToggleProps) {
  const { t } = useLanguage()
  const versionKeys = VERSION_COPY[heartVersion]

  return (
    <div
      className="heart-version-viewport"
      title={`${t(versionKeys.title)} — ${t(versionKeys.hint)}`}
    >
      <span className="heart-version-viewport-label">{t('heartVersion')}</span>
      <div
        className="heart-version-toggle heart-version-toggle--compact"
        role="group"
        aria-label={t('heartVersionGroup')}
      >
        {HEART_VERSIONS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={
              'heart-version-btn' +
              (heartVersion === v.id ? ' heart-version-btn--active' : '')
            }
            title={`${t(VERSION_COPY[v.id].title)} — ${t(VERSION_COPY[v.id].hint)}`}
            onClick={() => onHeartVersionChange(v.id)}
          >
            {t(VERSION_COPY[v.id].short)}
          </button>
        ))}
      </div>
    </div>
  )
}
