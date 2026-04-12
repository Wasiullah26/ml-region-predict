'use client'

import Link from 'next/link'
import type { PredictResponse } from '@/lib/predict-types'
import { ArrowLeft, Gauge, MapPin, Server, Trophy } from 'lucide-react'

function providerStyle(provider: string): string {
  const p = provider.toLowerCase()
  if (p.includes('aws')) return 'border-amber-500/40 bg-amber-500/10 text-amber-100'
  if (p.includes('azure')) return 'border-sky-500/40 bg-sky-500/10 text-sky-100'
  if (p.includes('gcp') || p.includes('google'))
    return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
  return 'border-white/15 bg-white/5 text-slate-200'
}

type Props = {
  result: PredictResponse
  onReset: () => void
}

export function PredictResults({ result, onReset }: Props) {
  const top = result.all_ranked[0]

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="glass rounded-2xl border-2 border-emerald-500/30 p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
                Recommended region
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">{result.optimal_dc_name}</h2>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-slate-300">
                <MapPin className="h-4 w-4 shrink-0 text-cyan-400" />
                {result.location}
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-sm font-medium ${providerStyle(result.provider)}`}
            >
              {result.provider}
            </span>
          </div>

          <dl className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-500">Est. latency</dt>
              <dd className="mt-1 text-2xl font-bold text-cyan-400">
                {result.est_latency_ms}
                <span className="text-base font-normal text-slate-500"> ms</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Confidence</dt>
              <dd className="mt-1 text-2xl font-bold text-purple-300">{result.confidence.toFixed(1)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Distance signal</dt>
              <dd className="mt-1 text-2xl font-bold text-white">
                {result.distance_km.toLocaleString()}
                <span className="text-base font-normal text-slate-500"> km</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Cloud region</dt>
              <dd className="mt-1 font-mono text-sm text-slate-200">{result.region}</dd>
            </div>
          </dl>

          <p className="mt-6 text-sm leading-relaxed text-slate-400">
            The model ranks candidate data centres using your geography-derived distance plus live-style
            network inputs (load, loss, bandwidth). Use alternatives below for failover planning.
          </p>
        </section>

        <aside className="glass flex flex-col justify-between rounded-2xl p-6">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-cyan-500/20">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top match</p>
            <p className="mt-2 text-lg font-semibold text-white">{top?.name}</p>
            <p className="mt-1 text-sm text-slate-400">{top?.location}</p>
          </div>
          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Ranking score</span>
              <span className="font-mono font-semibold text-cyan-300">{top?.score.toFixed(1)}</span>
            </div>
          </div>
        </aside>
      </div>

      <section className="glass overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
          <Server className="h-4 w-4 text-slate-400" />
          <h3 className="text-lg font-semibold text-white">Ranked alternatives</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-500">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Data centre</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Region</th>
                <th className="px-4 py-3 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {result.all_ranked.map((row, i) => (
                <tr key={row.dc_id} className="border-b border-white/5 text-slate-300 last:border-0">
                  <td className="px-4 py-3 font-mono text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                  <td className="px-4 py-3">{row.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-xs ${providerStyle(row.provider)}`}
                    >
                      {row.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.region}</td>
                  <td className="px-4 py-3 text-right font-mono text-cyan-300">{row.score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          New analysis
        </button>
        <Link
          href="/dashboard"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-sky-400 hover:to-cyan-300"
        >
          <Gauge className="h-4 w-4" />
          Open dashboard
        </Link>
      </div>
    </div>
  )
}
