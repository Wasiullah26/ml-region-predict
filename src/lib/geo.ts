export type GeoHub = {
  id: string
  label: string
  lat: number
  lon: number
}

export const GEO_HUBS: readonly GeoHub[] = [
  { id: 'uk-ie', label: 'UK & Ireland', lat: 53.35, lon: -6.26 },
  { id: 'eu-central', label: 'Central Europe (Frankfurt / Benelux)', lat: 50.11, lon: 8.68 },
  { id: 'eu-west', label: 'Western Europe (Paris / Amsterdam)', lat: 48.86, lon: 2.35 },
  { id: 'us-east', label: 'US East (Virginia / NY corridor)', lat: 38.9, lon: -77.0 },
  { id: 'us-west', label: 'US West (California / Oregon)', lat: 37.77, lon: -122.42 },
  { id: 'ca', label: 'Canada (Toronto / Central)', lat: 43.65, lon: -79.38 },
  { id: 'latam', label: 'Latin America (São Paulo)', lat: -23.55, lon: -46.63 },
  { id: 'me', label: 'Middle East (UAE)', lat: 25.2, lon: 55.27 },
  { id: 'in', label: 'India (Mumbai / Hyderabad)', lat: 19.08, lon: 72.88 },
  { id: 'sea', label: 'Southeast Asia (Singapore / Jakarta)', lat: 1.35, lon: 103.82 },
  { id: 'jp', label: 'Japan (Tokyo / Osaka)', lat: 35.68, lon: 139.76 },
  { id: 'kr', label: 'Korea (Seoul)', lat: 37.57, lon: 126.98 },
  { id: 'au-nz', label: 'Australia & NZ (Sydney / Melbourne)', lat: -33.87, lon: 151.21 },
  { id: 'za', label: 'South Africa (Cape Town / Johannesburg)', lat: -26.2, lon: 28.04 },
] as const

export function haversineKm(
  a: Pick<GeoHub, 'lat' | 'lon'>,
  b: Pick<GeoHub, 'lat' | 'lon'>,
): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  const km = R * c
  return Math.max(25, Math.round(km))
}

export function hubById(id: string): GeoHub | undefined {
  return GEO_HUBS.find((h) => h.id === id)
}

/** Geographic signal for /predict from the selected customer hub alone (not shown in UI). */
export function distanceKmForCustomerHub(customerHubId: string): number {
  const cust = hubById(customerHubId)
  const ref = hubById('eu-central')
  if (!cust || !ref) return 500
  return haversineKm(cust, ref)
}
