import { NextResponse } from 'next/server'

const DEFAULT_UPSTREAM =
  'https://w5l3srgiud.execute-api.eu-west-1.amazonaws.com/prod/predict'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  const upstream = process.env.PREDICT_API_URL ?? DEFAULT_UPSTREAM

  try {
    const res = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upstream error'
    return NextResponse.json({ message }, { status: 502 })
  }
}
