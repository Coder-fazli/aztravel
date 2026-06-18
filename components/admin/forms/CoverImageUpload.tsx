'use client'

import { useState, useRef, useCallback } from 'react'
import styles from './CoverImageUpload.module.css'

type Props = {
  /** hidden input name the resulting URL submits under (e.g. "coverImage") */
  name: string
  /** existing image URL (for edit) */
  defaultValue?: string
  onChange?: () => void
}

export default function CoverImageUpload({ name, defaultValue = '', onChange }: Props) {
  const [url, setUrl] = useState(defaultValue)
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(
    async (file: File) => {
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
        setUrl(data.url)
        onChange?.()
      } catch {
        setError('Upload failed. Try again.')
      } finally {
        setUploading(false)
      }
    },
    [onChange]
  )

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

  const remove = () => {
    setUrl('')
    onChange?.()
  }

  return (
    <div>
      {/* the value that submits with the form */}
      <input type="hidden" name={name} value={url} readOnly />

      {url ? (
        <div className={styles.preview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="cover" />
          <button type="button" className={styles.remove} onClick={remove} title="Remove image">×</button>
        </div>
      ) : (
        <div
          className={`${styles.zone} ${drag ? styles.drag : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          {uploading ? (
            <span>Uploading…</span>
          ) : (
            <>
              <span className={styles.icon}>⬆</span>
              <span>Drag &amp; drop an image, or <b>click to browse</b></span>
              <span className={styles.hint}>PNG, JPG, WEBP · up to 5&nbsp;MB</span>
            </>
          )}
        </div>
      )}

      {error && <span className={styles.error}>{error}</span>}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
    </div>
  )
}
