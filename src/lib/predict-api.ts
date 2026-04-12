import type { PredictRequest, PredictResponse } from '@/lib/predict-types'

export async function postPredict(body: PredictRequest): Promise<PredictResponse> {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  if (!res.ok) {
    let message = `Prediction failed (${res.status})`
    try {
      const j = JSON.parse(text) as { message?: string; error?: string }
      message = j.message ?? j.error ?? message
    } catch {
      if (text) message = text.slice(0, 200)
    }
    throw new Error(message)
  }

  return JSON.parse(text) as PredictResponse
}
