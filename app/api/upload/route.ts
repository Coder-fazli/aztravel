import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { connectDb } from '@/lib/db/connect'
import Media from '@/lib/db/models/Media'

// Local-disk image upload → /public/uploads, returns the public URL.
//
// ⚠️ Works in dev and on a long-running server (VPS / `next start`).
// It does NOT work on Vercel/serverless (read-only filesystem). To move to
// Cloudinary/S3 later, only this handler changes — the client stays the same.
//
// Public + unauthenticated (used by the anonymous e-Visa apply wizard), so
// this endpoint verifies real file content rather than trusting the client's
// declared Content-Type, and rate-limits per IP. HEIC/SVG/GIF intentionally
// unsupported for now — a passport photo is always JPEG/PNG/WebP.

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

function detectImageType(buffer: Buffer): { mime: string; ext: string } | null {
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { mime: 'image/jpeg', ext: 'jpg' }
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
    buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
  ) {
    return { mime: 'image/png', ext: 'png' }
  }
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // "RIFF"
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50   // "WEBP"
  ) {
    return { mime: 'image/webp', ext: 'webp' }
  }
  return null
}

// In-memory per-IP limit — resets on redeploy, fine for a single-process
// VPS. Add a Cloudflare Rate Limiting Rule at the edge for stronger, durable
// protection (this app is already proxied through Cloudflare).
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const uploadCounts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = uploadCounts.get(ip)
  if (!entry || now > entry.resetAt) {
    uploadCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

function getClientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 })
  }

  const form = await request.formData()
  const file = form.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const detected = detectImageType(buffer)
  if (!detected) {
    return NextResponse.json({ error: 'Please upload a JPG, PNG, or WebP image' }, { status: 415 })
  }

  const filename = `${randomUUID()}.${detected.ext}`

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)

  const url = `/uploads/${filename}` // files in /public are served from root

  // Record it in the media library.
  await connectDb()
  const doc = await Media.create({
    url,
    filename: file.name,
    mime: detected.mime,
    size: file.size,
  })

  return NextResponse.json({
    id: String(doc._id),
    url,
    filename: file.name,
    mime: detected.mime,
    size: file.size,
  })
}
