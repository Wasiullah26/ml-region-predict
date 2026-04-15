'use client'

import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { StoredOptimizerSession } from '@/lib/session-predict'
import type { RankedDataCenter } from '@/lib/predict-types'
import { Copy, Check } from 'lucide-react'

const tooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.96)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '12px',
  fontSize: '12px',
}

function providerFill(p: string): string {
  const x = p.toLowerCase()
  if (x.includes('aws')) return '#f59e0b'
  if (x.includes('azure')) return '#38bdf8'
  if (x.includes('gcp') || x.includes('google')) return '#34d399'
  return '#94a3b8'
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return `${s.slice(0, n - 1)}…`
}

function insightFromRanking(ranked: RankedDataCenter[]) {
  if (ranked.length < 2) {
    return {
      title: 'Single candidate list',
      body: 'The API returned one ranked list — use failover order below for redundancy planning.',
    }
  }
  const gap = ranked[0].score - ranked[1].score
  if (gap >= 4) {
    return {
      title: 'Strong lead for the top region',
      body: `${ranked[0].name} is well ahead of the next option on model score (${gap.toFixed(1)} points). A good default primary.`,
    }
  }
  if (gap >= 1.5) {
    return {
      title: 'Clear preference',
      body: `#1 beats #2 by ${gap.toFixed(1)} score points. Still worth monitoring #2 if your network profile shifts.`,
    }
  }
  return {
    title: 'Top two are close',
    body: `Only ${gap.toFixed(1)} score points between ${ranked[0].name} and ${ranked[1].name}. Test both or split traffic before locking in.`,
  }
}

function buildRunbookText(session: StoredOptimizerSession): string {
  const { request, data } = session
  const lines: string[] = [
    'CloudOptix — routing note',
    '',
    `PRIMARY: ${data.optimal_dc_name} (${data.provider})`,
    `Location: ${data.location}`,
    `API region id: ${data.region}`,
    '',
  ]
  if (request) {
    lines.push(
      'Request payload (what the UI sent to /predict):',
      `  distance_km: ${request.distance_km}`,
      `  network_load: ${request.network_load}`,
      `  packet_loss: ${request.packet_loss}`,
      `  bandwidth: ${request.bandwidth}`,
      '',
    )
  }
  lines.push('Ranked candidates (failover order):')
  data.all_ranked.forEach((r, i) => {
    lines.push(`  ${i + 1}. ${r.name} | ${r.provider} | ${r.region}`)
  })
  return lines.join('\n')
}

type Props = {
  session: StoredOptimizerSession
}

export function DashboardAnalytics({ session }: Props) {
  const d = session.data
  const [copied, setCopied] = useState(false)

  const rankingBars = useMemo(
    () =>
      d.all_ranked.map((r) => ({
        label: truncate(r.name, 26),
        fullName: r.name,
        score: Number(r.score.toFixed(2)),
        provider: r.provider,
      })),
    [d.all_ranked],
  )

  const providerMix = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of d.all_ranked) {
      map.set(r.provider, (map.get(r.provider) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [d.all_ranked])

  const insight = useMemo(() => insightFromRanking(d.all_ranked), [d.all_ranked])

  const chartH = Math.min(420, Math.max(260, rankingBars.length * 40))
  const maxScore = useMemo(
    () => Math.max(1, ...rankingBars.map((r) => r.score)),
    [rankingBars],
  )

  const runbookText = useMemo(() => buildRunbookText(session), [session])

  const copyRunbook = async () => {
    try {
      await navigator.clipboard.writeText(runbookText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-10 space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Kpi
          label="Distance signal (API)"
          value={d.distance_km.toLocaleString()}
          unit="km"
          accent="text-white"
        />
        <Kpi
          label="Candidates evaluated"
          value={`${d.all_ranked.length}`}
          unit=""
          accent="text-emerald-300"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white">What you should do with this</h3>
          <p className="mt-3 text-base font-medium text-cyan-200">{insight.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{insight.body}</p>
          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Suggested failover order
            </p>
            <ol className="mt-3 space-y-3">
              {d.all_ranked.slice(0, 5).map((r, i) => (
                <li key={r.dc_id} className="flex gap-3 text-sm">
                  <span className="font-mono text-slate-500">{i + 1}.</span>
                  <div>
                    <span className="font-medium text-white">{r.name}</span>
                    <span className="text-slate-500"> — </span>
                    <span className="text-slate-400">{r.provider}</span>
                    <span className="mt-0.5 block font-mono text-xs text-slate-500">{r.region}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white">Inputs sent to the model</h3>
            <p className="mt-1 text-xs text-slate-500">
              Same JSON your app POSTs to <code className="text-slate-400">/predict</code> — useful to
              reproduce or document this run.
            </p>
            {session.request ? (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <dt className="text-xs text-slate-500">distance_km</dt>
                  <dd className="font-mono text-cyan-300">{session.request.distance_km}</dd>
                </div>
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <dt className="text-xs text-slate-500">network_load</dt>
                  <dd className="font-mono text-cyan-300">{session.request.network_load}</dd>
                </div>
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <dt className="text-xs text-slate-500">packet_loss</dt>
                  <dd className="font-mono text-cyan-300">{session.request.packet_loss}</dd>
                </div>
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <dt className="text-xs text-slate-500">bandwidth</dt>
                  <dd className="font-mono text-cyan-300">{session.request.bandwidth}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Run the optimizer once more to store your slider values here — older saves only kept
                the API response.
              </p>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white">Copy for runbook / Slack</h3>
            <p className="mt-1 text-xs text-slate-500">
              The button copies everything in the preview below — plain text you can paste into Slack,
              Confluence, or a ticket.
            </p>
            <p className="mt-3 text-xs font-medium text-slate-400">Preview (exactly what gets copied)</p>
            <pre className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3 text-left text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap font-mono">
              {runbookText}
            </pre>
            <button
              type="button"
              onClick={copyRunbook}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 sm:w-auto"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy summary
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white">Model scores by data centre</h3>
          <p className="mt-1 text-xs text-slate-500">
            Higher score = better fit for this scenario (from <code className="text-slate-400">all_ranked</code>
            ).
          </p>
          <div className="mt-4" style={{ height: chartH }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={rankingBars}
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal />
                <XAxis
                  type="number"
                  domain={[0, Math.ceil(maxScore * 1.15)]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={148}
                  tick={{ fill: '#cbd5e1', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => [Number(value ?? 0), 'Score']}
                  labelFormatter={(_label, payload) => {
                    const p = payload?.[0]?.payload as { fullName?: string } | undefined
                    return p?.fullName ?? ''
                  }}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {rankingBars.map((row, i) => (
                    <Cell key={i} fill={providerFill(row.provider)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white">Providers in this ranking</h3>
          <p className="mt-1 text-xs text-slate-500">How many slots each cloud takes in the list.</p>
          <div className="mt-2 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={providerMix}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {providerMix.map((entry, i) => (
                    <Cell key={i} fill={providerFill(entry.name)} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => <span className="text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  unit,
  accent,
}: {
  label: string
  value: string
  unit: string
  accent: string
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${accent}`}>
        {value}
        {unit ? <span className="text-lg font-normal text-slate-500"> {unit}</span> : null}
      </p>
    </div>
  )
}
