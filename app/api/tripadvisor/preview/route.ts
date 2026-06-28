import { NextRequest, NextResponse } from 'next/server'
import { getPhotos, getDetails, getPlacesByIds } from '@/lib/tripadvisor/api'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const widget    = searchParams.get('widget') ?? ''
  const locationId = searchParams.get('locationId') ?? ''
  const placeIds  = searchParams.get('placeIds') ?? ''

  try {
    if (widget === 'photos') {
      const id = placeIds.split(',')[0]?.trim() || locationId
      const [photos, detail] = await Promise.all([
        getPhotos(id, 1),
        getDetails(id),
      ])
      return NextResponse.json({
        type: 'photos',
        name: detail?.name ?? '',
        photoUrl: photos?.[0]?.images?.medium?.url || photos?.[0]?.images?.small?.url || null,
        ok: photos?.length > 0,
      })
    }

    if (widget === 'reviews') {
      const detail = await getDetails(locationId)
      return NextResponse.json({
        type: 'reviews',
        name: detail?.name ?? '',
        rating: detail?.rating ?? null,
        numReviews: detail?.num_reviews ?? null,
        webUrl: detail?.web_url ?? null,
        ok: !!detail?.name,
      })
    }

    if (widget === 'list') {
      const ids = placeIds.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3)
      const places = await getPlacesByIds(ids)
      return NextResponse.json({
        type: 'list',
        names: places.map((p: any) => p.name).filter(Boolean),
        ok: places.length > 0,
      })
    }

    // nearby (hotels / attractions / restaurants) — just verify the locationId resolves
    if (locationId) {
      const detail = await getDetails(locationId)
      return NextResponse.json({
        type: 'nearby',
        name: detail?.name ?? locationId,
        ok: !!detail?.name,
      })
    }

    return NextResponse.json({ ok: false })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
