'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './MediaManager.module.css'

type MediaItem = { _id: string; url: string; filename?: string; size?: number }

export default function MediaManager() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)
  const [copied, setCopied] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/media')
      setItems(await r.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const upload = useCallback(async (files: FileList) => {
    setUploading(true)
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body })
      if (res.ok) {
        const d = await res.json()
        setItems((prev) => [{ _id: d.id, url: d.url, filename: d.filename, size: d.size }, ...prev])
      }
    }
    setUploading(false)
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    if (e.dataTransfer.files?.length) upload(e.dataTransfer.files)
  }

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) upload(e.target.files)
    e.target.value = ''
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this image? This cannot be undone.')) return
    await fetch(`/api/media?id=${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((m) => m._id !== id))
  }

  const copy = (url: string) => {
    navigator.clipboard?.writeText(window.location.origin + url)
    setCopied(url)
    setTimeout(() => setCopied(''), 1200)
  }

  return (
    <>
      <div
        className={`${styles.drop} ${drag ? styles.drag : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        {uploading ? 'Uploading…' : <>⬆ Drag &amp; drop images, or <b>click to upload</b> (multiple allowed)</>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPick} />

      <p className={styles.count}>{items.length} images</p>

      <div className={styles.grid}>
        {loading && <p className={styles.muted}>Loading…</p>}
        {!loading && items.length === 0 && <p className={styles.muted}>No images yet — upload some above.</p>}
        {items.map((m) => (
          <div className={styles.tile} key={m._id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.filename ?? ''} />
            <div className={styles.actions}>
              <button type="button" onClick={() => copy(m.url)} title="Copy URL">
                {copied === m.url ? '✓ Copied' : 'Copy URL'}
              </button>
              <button type="button" className={styles.del} onClick={() => remove(m._id)} title="Delete">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
