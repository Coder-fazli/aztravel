import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// Local-disk image upload → /public/uploads, returns the public URL.
//
// ⚠️ Works in dev and on a long-running server (VPS / `next start`).
// It does NOT work on Vercel/serverless (read-only filesystem). To move to
// Cloudinary/S3 later, only this handler changes — the client stays the same.

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

export async function POST(request: Request) {
  const form = await request.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
  const filename = `${randomUUID()}.${ext}`

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)

  // Public URL (files in /public are served from the root).
  return NextResponse.json({ url: `/uploads/${filename}` })
}
