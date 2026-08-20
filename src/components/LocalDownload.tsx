import {
  GITHUB_REPO_URL,
  README_DOWNLOAD_EN_URL,
  README_DOWNLOAD_ZH_URL,
  SOURCE_ZIP_URL,
  VIEW_ZIP_URL,
} from '../download/localCopy'

export default function LocalDownload() {
  return (
    <section className="anatomy-section local-download" aria-label="Local download">
      <h2 className="anatomy-section-title">Local copy · 本地下载</h2>
      <p className="anatomy-version-hint">
        Download the simulator to your computer to view it or debug the source.
        The full entry lives in the GitHub README intro.
      </p>
      <div className="local-download-actions">
        <a
          className="local-download-btn"
          href={SOURCE_ZIP_URL}
          target="_blank"
          rel="noreferrer"
        >
          Source ZIP
        </a>
        <a
          className="local-download-btn"
          href={VIEW_ZIP_URL}
          target="_blank"
          rel="noreferrer"
        >
          View ZIP
        </a>
      </div>
      <p className="local-download-links">
        <a href={README_DOWNLOAD_ZH_URL} target="_blank" rel="noreferrer">
          本地下载与调试
        </a>
        <span aria-hidden="true"> · </span>
        <a href={README_DOWNLOAD_EN_URL} target="_blank" rel="noreferrer">
          Download locally and debug
        </a>
        <span aria-hidden="true"> · </span>
        <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </p>
    </section>
  )
}
