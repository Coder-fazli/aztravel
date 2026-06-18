'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './MediaLibrary.module.css'

type MediaItem = { _id: string; url: string; filename?: string; mime?: string; size?: number }

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export default function MediaLibrary({ open, onClose, onSelect }: Props) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/media')
      setItems(await res.json())
    } catch {
      setError('Could not load media.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setSelected('')
      setError('')
      load()
    }
  }, [open, load])

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setError('')
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body })
      if (!res.ok) throw new Error()
      const data = await res.json()
      // prepend the new image and auto-select it
      setItems((prev) => [{ _id: data.id, url: data.url, filename: data.filename }, ...prev])
      setSelected(data.url)
    } catch {
      setError('Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) upload(file)
  }

  const remove = async (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation()
    if (!confirm('Delete this image from the library?')) return
    await fetch(`/api/media?id=${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((m) => m._id !== id))
    if (selected === url) setSelected('')
  }

  const confirmSelect = () => {
    if (!selected) return
    onSelect(selected)
    onClose()
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h3 className={styles.title}>Media library</h3>
          <button type="button" className={styles.close} onClick={onClose}>×</button>
        </div>

        {/* upload strip */}
        <div
          className={`${styles.uploadStrip} ${drag ? styles.drag : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          {uploading ? 'Uploading…' : <>⬆ Drag &amp; drop or <b>click to upload</b> from your computer</>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />

        {/* grid of existing images */}
        <div className={styles.grid}>
          {loading && <p className={styles.muted}>Loading…</p>}
          {!loading && items.length === 0 && <p className={styles.muted}>No images yet — upload one above.</p>}
          {items.map((m) => (
            <button
              type="button"
              key={m._id}
              className={`${styles.tile} ${selected === m.url ? styles.tileActive : ''}`}
              onClick={() => setSelected(m.url)}
              title={m.filename}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.filename ?? ''} />
              <span className={styles.del} onClick={(e) => remove(e, m._id, m.url)} title="Delete">×</span>
            </button>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.foot}>
          <button type="button" className={styles.cancel} onClick={onClose}>Cancel</button>
          <button type="button" className={styles.select} onClick={confirmSelect} disabled={!selected}>
            Use selected
          </button>
        </div>
      </div>
    </div>
  )
}
