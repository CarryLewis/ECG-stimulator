import { useEffect, useState, type MouseEvent } from 'react'
import {
  GITHUB_REPO_URL,
  README_DOWNLOAD_EN_URL,
  README_DOWNLOAD_ZH_URL,
  SOURCE_ZIP_URL,
  VIEW_ZIP_URL,
  resolveLatestMainCommit,
  viewZipUrlNow,
  type LatestMainCommit,
} from '../download/localCopy'

export default function LocalDownload() {
  const [latest, setLatest] = useState<LatestMainCommit | null>(null)

  useEffect(() => {
    let cancelled = false
    void resolveLatestMainCommit().then((commit) => {
      if (!cancelled) setLatest(commit)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function onSourceClick(
    event: MouseEvent<HTMLAnchorElement>,
  ): Promise<void> {
    event.preventDefault()
    const commit = latest ?? (await resolveLatestMainCommit())
    const href = commit?.sourceZipUrl ?? SOURCE_ZIP_URL
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  function onViewClick(event: MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault()
    window.open(viewZipUrlNow(), '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="anatomy-section local-download" aria-label="Local download">
      <h2 className="anatomy-section-title">Local copy · 本地下载</h2>
      <p className="anatomy-version-hint">
        Always the latest <code>main</code> — rebuilt after every code update.
        每次代码更新后都可下载到最新文件。
      </p>
      <div className="local-download-actions">
        <a
          className="local-download-btn"
          href={latest?.sourceZipUrl ?? SOURCE_ZIP_URL}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => {
            void onSourceClick(event)
          }}
        >
          Source ZIP
        </a>
        <a
          className="local-download-btn"
          href={VIEW_ZIP_URL}
          target="_blank"
          rel="noreferrer"
          onClick={onViewClick}
        >
          View ZIP
        </a>
      </div>
      <p className="local-download-meta">
        {latest
          ? `latest main @ ${latest.shortSha}`
          : 'latest main (live snapshot)'}
      </p>
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
