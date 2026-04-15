'use client'

import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import Image from 'next/image'
import { PageShell } from '@/components/PageShell'
import { PredictResults } from '@/components/optimizer/PredictResults'
import { GEO_HUBS, distanceKmForCustomerHub } from '@/lib/geo'
import { postPredict } from '@/lib/predict-api'
import { saveOptimizerSession } from '@/lib/session-predict'
import type { PredictResponse } from '@/lib/predict-types'
import {
  Activity,
  Globe,
  Loader2,
  MapPin,
  RadioTower,
  SlidersHorizontal,
  Zap,
} from 'lucide-react'

export default function OptimizerPage() {
  const [customerHubId, setCustomerHubId] = useState('sea')
  const [networkLoad, setNetworkLoad] = useState(0.42)
  const [packetLoss, setPacketLoss] = useState(0.8)
  const [bandwidth, setBandwidth] = useState(850)
  const [result, setResult] = useState<PredictResponse | null>(null)

  const distanceKm = useMemo(() => distanceKmForCustomerHub(customerHubId), [customerHubId])

  const mutation = useMutation({
    mutationFn: postPredict,
    onSuccess: (data, variables) => {
      setResult(data)
      saveOptimizerSession(variables, data)
      toast.success('Recommendation ready')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not reach the prediction service')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      distance_km: Number(distanceKm),
      network_load: networkLoad,
      packet_loss: packetLoss,
      bandwidth,
    })
  }

  const bg = (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
      <div
        className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl"
        style={{ animationDelay: '1s' }}
      />
    </div>
  )

  if (result) {
    return (
      <PageShell>
        <div className="relative flex-1">
          {bg}
          <div className="relative mx-auto max-w-6xl flex-1 px-4 py-12 sm:px-6">
            <PredictResults result={result} onReset={() => setResult(null)} />
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="relative flex-1">
        {bg}
        <div className="relative mx-auto max-w-6xl flex-1 px-4 py-12 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Region optimizer
                </h1>
                <p className="mt-2 max-w-xl text-slate-400">
                  Say where you or your customers are mainly based, then set your network profile.
                  CloudOptix returns a ranked recommendation across public-cloud regions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="glass space-y-6 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-white">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-lg font-semibold">Geography</h2>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="customer" className="text-sm text-slate-300">
                      Where are you based, or where are your customers mainly located?
                    </label>
                    <select
                      id="customer"
                      value={customerHubId}
                      onChange={(e) => setCustomerHubId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none ring-cyan-400/30 focus:ring-2"
                    >
                      {GEO_HUBS.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="glass space-y-6 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-white">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-lg font-semibold">Network profile</h2>
                  </div>
                  <p className="text-sm text-slate-500">
                    Reflect congestion, loss, and throughput you expect between users and your edge or
                    backbone.
                  </p>

                  <div className="space-y-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-slate-300">
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          Network load (0–1)
                        </span>
                        <span className="font-mono text-sm text-cyan-300">{networkLoad.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={networkLoad}
                        onChange={(e) => setNetworkLoad(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-slate-300">
                          <RadioTower className="h-3.5 w-3.5" />
                          Packet loss
                        </span>
                        <span className="font-mono text-sm text-cyan-300">{packetLoss.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.1}
                        value={packetLoss}
                        onChange={(e) => setPacketLoss(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-slate-300">Bandwidth (Mbps)</span>
                        <span className="font-mono text-sm text-cyan-300">{bandwidth}</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={2000}
                        step={10}
                        value={bandwidth}
                        onChange={(e) => setBandwidth(parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/20 transition enabled:hover:from-sky-400 enabled:hover:to-cyan-300 disabled:opacity-60"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Running model…
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Get recommendation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <aside className="glass flex min-h-[420px] flex-col justify-between rounded-2xl p-8">
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-cyan-500/25">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">For startups & platform teams</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-400">
                  <li>• Pick your region, then tune the network sliders.</li>
                  <li>• Get a ranked list across AWS, Azure, and GCP candidates.</li>
                  <li>• No account — share the link in a pitch or architecture review.</li>
                </ul>
              </div>
              <div className="relative mt-8 flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/15 blur-3xl" />
                <Image
                  src="/cloudoptix-logo.png"
                  alt=""
                  width={200}
                  height={200}
                  className="relative opacity-90"
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
