import { NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { connectDb } from '@/lib/db/connect'
import Media from '@/lib/db/models/Media'

// GET /api/media → list all media (newest first)
export async function GET() {
  await connectDb()
  const items = await Media.find().sort({ createdAt: -1 }).lean()
  return NextResponse.json(JSON.parse(JSON.stringify(items)))
}

// DELETE /api/media?id=... → remove the DB record and the file on disk
export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await connectDb()
  const doc = await Media.findByIdAndDelete(id)

  // best-effort: remove the underlying file from /public/uploads
  if (doc?.url?.startsWith('/uploads/')) {
    try {
      await unlink(path.join(process.cwd(), 'public', doc.url))
    } catch {
      /* file already gone — ignore */
    }
  }

  return NextResponse.json({ ok: true })
}
