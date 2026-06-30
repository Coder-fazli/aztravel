'use server'

import { connectDb } from '@/lib/db/connect'
import Tour from '@/lib/db/models/Tour'

export type ToursFilters = {
  categories?: string[]
  priceMin?:   number
  priceMax?:   number
  durations?:  string[]   // '1-3' | '4-7' | '8-14'
  dateStart?:  string
  dateEnd?:    string
  rating?:     number
  page?:       number
  limit?:      number
}

export async function getTours(filters: ToursFilters = {}) {
  await connectDb()

  const q: Record<string, any> = { status: 'active' }

  if (filters.categories?.length)
    q.categories = { $in: filters.categories }

  if (filters.priceMin || filters.priceMax)
    q['price.final'] = {
      ...(filters.priceMin ? { $gte: filters.priceMin } : {}),
      ...(filters.priceMax ? { $lte: filters.priceMax } : {}),
    }

  if (filters.durations?.length) {
    const ranges = filters.durations.map((d) => {
      if (d === '1-3')  return { 'duration.value': { $gte: 1,  $lte: 3  } }
      if (d === '4-7')  return { 'duration.value': { $gte: 4,  $lte: 7  } }
      if (d === '8-14') return { 'duration.value': { $gte: 8,  $lte: 14 } }
      return null
    }).filter(Boolean)
    if (ranges.length) q.$or = ranges
  }

  if (filters.dateStart && filters.dateEnd)
    q.availableDates = {
      $elemMatch: {
        $gte: new Date(filters.dateStart),
        $lte: new Date(filters.dateEnd),
      },
    }

  if (filters.rating)
    q['rating.avg'] = { $gte: filters.rating }

  const limit = Math.min(filters.limit ?? 10, 50)
  const skip  = ((filters.page ?? 1) - 1) * limit

  const [tours, total] = await Promise.all([
    Tour.find(q)
      .populate('location', 'name slug')
      .skip(skip)
      .limit(limit)
      .lean(),
    Tour.countDocuments(q),
  ])

  return {
    tours,
    total,
    pages: Math.ceil(total / limit),
    limit,
  }
}

export async function getTourBySlug(slug: string) {
  await connectDb()
  return Tour.findOne({ slug, status: 'active' })
    .populate('location', 'name slug')
    .populate('guide', 'name avatar languages specializations')
    .lean()
}
