'use client'

import { useState, useRef, useCallback } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Placeholder } from '@tiptap/extension-placeholder'
import { contentExtensions } from '@/lib/tiptap/extensions'
import styles from './RichTextEditor.module.css'

type Props = {
  /** hidden input name the JSON gets submitted under (e.g. "content") */
  name: string
  /** existing TipTap JSON doc (for edit) */
  defaultValue?: any
  placeholder?: string
  dir?: 'ltr' | 'rtl'
  /** called whenever the doc changes — lets the parent form mark itself dirty */
  onChange?: () => void
}

/** A toolbar button. `active` highlights it when the mark/node is on. */
function Btn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.btn} ${active ? styles.btnActive : ''}`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({
  name,
  defaultValue,
  placeholder = 'Write here…',
  dir = 'ltr',
  onChange,
}: Props) {
  // The JSON string that actually gets submitted with the form.
  const [json, setJson] = useState<string>(
    defaultValue ? JSON.stringify(defaultValue) : ''
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    // v3: never render on the server — avoids hydration mismatch in this Next setup.
    immediatelyRender: false,
    extensions: [...contentExtensions, Placeholder.configure({ placeholder })],
    content: defaultValue ?? '',
    editorProps: { attributes: { class: styles.prose, dir } },
    onUpdate: ({ editor }) => {
      setJson(JSON.stringify(editor.getJSON()))
      onChange?.()
    },
  })

  // Upload an image file to /api/upload, then insert the returned URL.
  const onPickImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = '' // allow re-picking the same file later
      if (!file || !editor) return

      const body = new FormData()
      body.append('file', file)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body })
        if (!res.ok) throw new Error('upload failed')
        const { url } = await res.json()
        editor.chain().focus().setImage({ src: url }).run()
        onChange?.()
      } catch {
        alert('Image upload failed.')
      }
    },
    [editor, onChange]
  )

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', prev ?? 'https://')
    if (url === null) return // cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={styles.wrap}>
      <Toolbar editor={editor} onLink={setLink} onImage={() => fileInputRef.current?.click()} />

      {/* floating toolbar that appears next to a text selection */}
      <BubbleMenu editor={editor} className={styles.bubble}>
        <Btn title="Bold"   active={editor.isActive('bold')}   onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></Btn>
        <Btn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></Btn>
        <Btn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></Btn>
        <Btn title="Highlight" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>🖊</Btn>
        <Btn title="Link" active={editor.isActive('link')} onClick={setLink}>🔗</Btn>
      </BubbleMenu>

      <EditorContent editor={editor} className={styles.editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onPickImage}
      />

      {/* the value that actually submits with the <form> */}
      <input type="hidden" name={name} value={json} readOnly />
    </div>
  )
}

/** The sticky top toolbar (block-level + inline controls). */
function Toolbar({
  editor,
  onLink,
  onImage,
}: {
  editor: Editor
  onLink: () => void
  onImage: () => void
}) {
  const heading = (level: 1 | 2 | 3) => () =>
    editor.chain().focus().toggleHeading({ level }).run()

  return (
    <div className={styles.toolbar}>
      <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↶</Btn>
      <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↷</Btn>
      <span className={styles.sep} />

      <Btn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={heading(1)}>H1</Btn>
      <Btn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={heading(2)}>H2</Btn>
      <Btn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={heading(3)}>H3</Btn>
      <Btn title="Paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>¶</Btn>
      <span className={styles.sep} />

      <Btn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></Btn>
      <Btn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></Btn>
      <Btn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></Btn>
      <Btn title="Strike" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></Btn>
      <Btn title="Highlight" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>🖊</Btn>
      <span className={styles.sep} />

      <Btn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>•</Btn>
      <Btn title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</Btn>
      <Btn title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</Btn>
      <Btn title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{'</>'}</Btn>
      <span className={styles.sep} />

      <Btn title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>⬅</Btn>
      <Btn title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>⬌</Btn>
      <Btn title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>➡</Btn>
      <span className={styles.sep} />

      <Btn title="Link" active={editor.isActive('link')} onClick={onLink}>🔗</Btn>
      <Btn title="Image" onClick={onImage}>🖼</Btn>
      <Btn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>―</Btn>
    </div>
  )
}
