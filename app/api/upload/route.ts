import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import heicConvert from 'heic-convert'
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
// declared Content-Type, and rate-limits per IP. SVG/GIF intentionally
// unsupported — a passport photo is always JPEG/PNG/WebP/HEIC.

// Must match (or exceed) the UI's advertised limit -- the field description
// and the client-side check in DynamicField.tsx both say "max 10000KB".
// This used to be a separate, lower 5MB here, so real (non-tiny) phone
// photos between 5-10MB were silently rejected after the client had already
// accepted them.
const MAX_BYTES = 10000 * 1024 // 10000 KB, matches the field's own copy

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

// HEIC/HEIF: ISO base media file — "ftyp" box at offset 4, brand code at
// offset 8. iPhones default to this format, so passport photos taken
// straight from the Camera app commonly arrive as HEIC.
const HEIC_BRANDS = ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1']
function isHeic(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70 && // "ftyp"
    HEIC_BRANDS.includes(buffer.slice(8, 12).toString('ascii'))
  )
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
    return NextResponse.json({ error: `File too large (max ${Math.round(MAX_BYTES / 1024)}KB)` }, { status: 413 })
  }

  let buffer = Buffer.from(await file.arrayBuffer())
  let detected = detectImageType(buffer)

  // Browsers (other than Safari) can't render HEIC in an <img> tag, so a
  // stored-as-is HEIC would just be another broken image everywhere it's
  // reviewed (admin panel, applicant confirmation). Decode and re-encode as
  // JPEG here so the rest of the app never has to know HEIC was involved.
  if (!detected && isHeic(buffer)) {
    try {
      const converted = await heicConvert({ buffer, format: 'JPEG', quality: 0.9 })
      buffer = Buffer.from(converted)
      detected = { mime: 'image/jpeg', ext: 'jpg' }
    } catch {
      return NextResponse.json({
        error: 'This HEIC photo could not be converted. Please export it as JPG or PNG and try again (on iPhone: Settings → Camera → Formats → Most Compatible).',
      }, { status: 415 })
    }
  }

  if (!detected) {
    return NextResponse.json({ error: 'Please upload a JPG, PNG, WebP, or HEIC image' }, { status: 415 })
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
    size: buffer.length, // the stored file's size, not the original upload's (differs after HEIC conversion)
  })

  return NextResponse.json({
    id: String(doc._id),
    url,
    filename: file.name,
    mime: detected.mime,
    size: buffer.length,
  })
}
