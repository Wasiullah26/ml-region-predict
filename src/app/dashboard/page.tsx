'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { DashboardAnalytics } from '@/components/dashboard/DashboardAnalytics'
import { loadLastSession, type StoredOptimizerSession } from '@/lib/session-predict'
import { Gauge } from 'lucide-react'

export default function DashboardPage() {
  const [session, setSession] = useState<StoredOptimizerSession | null>(null)

  useEffect(() => {
    setSession(loadLastSession())
  }, [])

  return (
    <PageShell>
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/3 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl flex-1 px-4 py-12 sm:px-6">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="mt-2 max-w-2xl text-slate-400">
                Actionable view of your <strong className="text-slate-300">last successful API</strong>{' '}
                result: failover order, decision context, inputs you sent, and charts from the same
                response.
              </p>
            </div>
            <Link
              href="/optimizer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-sky-400 hover:to-cyan-300"
            >
              <Gauge className="h-4 w-4" />
              New analysis
            </Link>
          </div>

          {session ? (
            <>
              <div className="mt-8 glass rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Latest recommendation
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{session.data.optimal_dc_name}</h2>
                <p className="mt-1 text-slate-400">
                  {session.data.location} · {session.data.provider} · {session.data.region}
                </p>
              </div>
              <DashboardAnalytics session={session} />
            </>
          ) : (
            <div className="mt-10 glass rounded-2xl p-10 text-center">
              <p className="text-slate-400">
                No saved result yet. Run the optimizer — we&apos;ll show failover order, the exact
                inputs sent to <code className="text-cyan-400/90">/predict</code>, and copyable text
                for your team.
              </p>
              <Link
                href="/optimizer"
                className="mt-6 inline-block rounded-xl border border-white/15 px-6 py-3 font-medium text-white hover:bg-white/5"
              >
                Go to optimizer
              </Link>
            </div>
          )}

          <p className="mt-12 text-center text-xs text-slate-600">
            Everything here is from your last response in this browser. For org-wide history,
            persist runs in your backend.
          </p>
        </div>
      </main>
    </PageShell>
  )
}
