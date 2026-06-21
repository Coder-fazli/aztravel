'use client'

import { useState, useCallback } from 'react'
import styles from './CoverImageUpload.module.css'
import MediaLibrary from '@/components/admin/MediaLibrary'

type Props = {
  /** hidden input name the URL submits under; omit when capturing via onValueChange */
  name?: string
  /** existing image URL (for edit) */
  defaultValue?: string
  /** input name for the alt text (e.g. "coverImageAlt") */
  altName?: string
  defaultAlt?: string
  onChange?: () => void
  /** reports the current URL on every change (upload / pick / remove) */
  onValueChange?: (url: string) => void
}

export default function CoverImageUpload({
  name,
  defaultValue = '',
  altName,
  defaultAlt = '',
  onChange,
  onValueChange,
}: Props) {
  const [url, setUrl] = useState(defaultValue)
  const [alt, setAlt] = useState(defaultAlt)
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')
  const [libOpen, setLibOpen] = useState(false)

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
        onValueChange?.(data.url)
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

  const remove = () => {
    setUrl('')
    onValueChange?.('')
    onChange?.()
  }

  return (
    <div>
      {/* the value that submits with the form (omit when captured via onValueChange) */}
      {name && <input type="hidden" name={name} value={url} readOnly />}

      {url ? (
        <>
          {/* click the image → open the library to replace */}
          <div className={styles.preview} onClick={() => setLibOpen(true)} title="Click to replace">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={alt || 'cover'} />
            <div className={styles.overlay}><span>Click to replace</span></div>
            <button
              type="button"
              className={styles.remove}
              onClick={(e) => { e.stopPropagation(); remove() }}
              title="Remove image"
            >×</button>
          </div>

          {/* alt text (SEO / accessibility) */}
          {altName && (
            <input
              name={altName}
              className={styles.alt}
              value={alt}
              onChange={(e) => { setAlt(e.target.value); onChange?.() }}
              placeholder="Alt text — describe the image"
            />
          )}
        </>
      ) : (
        <div
          className={`${styles.zone} ${drag ? styles.drag : ''}`}
          onClick={() => setLibOpen(true)}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          {uploading ? (
            <span>Uploading…</span>
          ) : (
            <>
              <span className={styles.icon}>🖼</span>
              <span><b>Choose from Media Library</b></span>
              <span className={styles.hint}>or drag &amp; drop an image to upload</span>
            </>
          )}
        </div>
      )}

      {error && <span className={styles.error}>{error}</span>}

      <MediaLibrary
        open={libOpen}
        onClose={() => setLibOpen(false)}
        onSelect={(u) => { setUrl(u); onValueChange?.(u); onChange?.() }}
      />
    </div>
  )
}
