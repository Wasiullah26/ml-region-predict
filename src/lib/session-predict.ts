import type { PredictRequest, PredictResponse } from '@/lib/predict-types'

const KEY = 'cloudoptix:last-session'

/** Last optimizer result plus the request body (for dashboard context). */
export type StoredOptimizerSession = {
  at: number
  /** Present after newer saves; older tabs may only have `data`. */
  request?: PredictRequest
  data: PredictResponse
}

export function saveOptimizerSession(request: PredictRequest, data: PredictResponse): void {
  if (typeof window === 'undefined') return
  try {
    const entry: StoredOptimizerSession = { at: Date.now(), request, data }
    sessionStorage.setItem(KEY, JSON.stringify(entry))
  } catch {
    /* ignore */
  }
}

export function loadLastSession(): StoredOptimizerSession | null {
  if (typeof window === 'undefined') return null
  try {
    const legacyPredict = sessionStorage.getItem('cloudoptix:last-predict')
    const raw = sessionStorage.getItem(KEY) ?? legacyPredict
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed && typeof parsed === 'object' && parsed.data && typeof parsed.data === 'object') {
      return {
        at: Number(parsed.at) || Date.now(),
        request: parsed.request as PredictRequest | undefined,
        data: parsed.data as PredictResponse,
      }
    }
    return null
  } catch {
    return null
  }
}
