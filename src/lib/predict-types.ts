export type PredictRequest = {
  distance_km: number
  network_load: number
  packet_loss: number
  bandwidth: number
}

export type RankedDataCenter = {
  dc_id: number
  name: string
  provider: string
  location: string
  region: string
  score: number
}

export type PredictResponse = {
  optimal_dc_name: string
  provider: string
  region: string
  location: string
  confidence: number
  distance_km: number
  est_latency_ms: number
  all_ranked: RankedDataCenter[]
}
