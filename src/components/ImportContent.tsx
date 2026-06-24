'use client'

import React, { useState } from 'react'

/**
 * Dashboard widget: upload a content.json (+ images) to fill/update this
 * tenant's site content and portfolio in one shot. Posts to the
 * /api/import-content endpoint, which runs the same idempotent upsert as the
 * CLI seeder. Safe to re-run.
 */
const ImportContent: React.FC = () => {
  const [content, setContent] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setErr(null)
    setMsg(null)
    if (!content) {
      setErr('Choose a content.json file first.')
      return
    }
    const fd = new FormData()
    fd.append('content', content)
    images.forEach((f) => fd.append('images', f))

    setBusy(true)
    try {
      const res = await fetch('/api/import-content', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok || json.ok === false) throw new Error(json.error || `HTTP ${res.status}`)
      setMsg(
        `Imported into "${json.tenant}": ${json.portfolioCount} portfolio item(s), ${json.imagesUploaded} image(s) uploaded.`,
      )
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
        padding: '1rem 1.25rem',
        margin: '1.5rem 0',
      }}
    >
      <h3 style={{ margin: '0 0 .25rem' }}>Import content</h3>
      <p style={{ margin: '0 0 1rem', color: 'var(--theme-elevation-500)', maxWidth: 560 }}>
        Upload a <code>content.json</code> and its images to fill or update this tenant&rsquo;s
        site content and portfolio in one step. Re-running is safe — existing items are updated,
        not duplicated.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', maxWidth: 560 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
          <span>content.json</span>
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => setContent(e.target.files?.[0] ?? null)}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
          <span>Images (referenced by name in content.json)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(e.target.files ? Array.from(e.target.files) : [])}
          />
        </label>
        <button
          type="button"
          className="btn btn--style-primary"
          disabled={busy}
          onClick={submit}
          style={{ alignSelf: 'flex-start' }}
        >
          {busy ? 'Importing…' : 'Import'}
        </button>
        {msg && <p style={{ color: 'var(--theme-success-500)', margin: 0 }}>{msg}</p>}
        {err && <p style={{ color: 'var(--theme-error-500)', margin: 0 }}>{err}</p>}
      </div>
    </div>
  )
}

export default ImportContent
