const BASE = 'https://api.content.tripadvisor.com/api/v1'
const CACHE = { next: { revalidate: 86400 } } as const

function key() {
  return process.env.TRIPADVISOR_API_KEY ?? ''
}

export async function searchLocation(query: string) {
  const url = `${BASE}/location/search?searchQuery=${encodeURIComponent(query)}&key=${key()}`
  const res = await fetch(url, CACHE)
  if (!res.ok) return null
  const json = await res.json()
  return json.data ?? []
}

export async function getDetails(locationId: string) {
  const url = `${BASE}/location/${locationId}/details?key=${key()}`
  const res = await fetch(url, CACHE)
  if (!res.ok) return null
  return res.json()
}

export async function getPlaces(locationId: string, category: string, limit = 5) {
  const url = `${BASE}/location/${locationId}/nearby_search?category=${category}&limit=${limit}&key=${key()}`
  const res = await fetch(url, CACHE)
  if (!res.ok) return []
  const json = await res.json()
  return (json.data ?? []).slice(0, limit)
}

export async function getReviews(locationId: string, limit = 5) {
  const url = `${BASE}/location/${locationId}/reviews?limit=${limit}&key=${key()}`
  const res = await fetch(url, CACHE)
  if (!res.ok) return []
  const json = await res.json()
  return (json.data ?? []).slice(0, limit)
}

export async function getPhotos(locationId: string, limit = 1) {
  const url = `${BASE}/location/${locationId}/photos?limit=${limit}&key=${key()}`
  const res = await fetch(url, CACHE)
  if (!res.ok) return []
  const json = await res.json()
  return (json.data ?? []).slice(0, limit)
}
