'use client'

import { useState } from 'react'
import MediaLibrary from '@/components/admin/MediaLibrary'
import styles from './GalleryImageUpload.module.css'

type Props = {
  /** form field name — submits a JSON array of URLs */
  name?: string
  defaultValue?: string[]
  onChange?: () => void
}

export default function GalleryImageUpload({ name, defaultValue = [], onChange }: Props) {
  const [images, setImages] = useState<string[]>(defaultValue)
  const [libOpen, setLibOpen] = useState(false)

  function handleSelectMultiple(urls: string[]) {
    setImages(prev => {
      const merged = [...prev]
      for (const u of urls) {
        if (!merged.includes(u)) merged.push(u)
      }
      return merged
    })
    onChange?.()
  }

  function remove(url: string) {
    setImages(prev => prev.filter(u => u !== url))
    onChange?.()
  }

  return (
    <div className={styles.wrap}>
      {name && <input type="hidden" name={name} value={JSON.stringify(images)} readOnly />}

      <div className={styles.grid}>
        {images.map((url, i) => (
          <div key={url} className={styles.thumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Tour image ${i + 1}`} />
            <button
              type="button"
              className={styles.remove}
              onClick={() => remove(url)}
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}

        {/* add card */}
        <button
          type="button"
          className={styles.addCard}
          onClick={() => setLibOpen(true)}
        >
          <span className={styles.addIcon}>＋</span>
          <span className={styles.addLabel}>Add images</span>
        </button>
      </div>

      <MediaLibrary
        open={libOpen}
        onClose={() => setLibOpen(false)}
        onSelectMultiple={handleSelectMultiple}
      />
    </div>
  )
}
