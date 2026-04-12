import Image from 'next/image'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { ArrowRight, Brain, Globe2, LineChart, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <PageShell>
      <div className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <main className="relative mx-auto max-w-6xl flex-1 px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-cyan-400/90">
                AWS · Azure · GCP
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Deploy to the right region, not just the nearest pin.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-400">
                CloudOptix combines where your users are, where you plan to run workloads, and
                real-world network conditions to recommend which public-cloud data centre will
                deliver the best latency and reliability for you right now.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/optimizer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:from-sky-400 hover:to-cyan-300"
                >
                  Open optimizer
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-base font-medium text-slate-200 transition hover:bg-white/5"
                >
                  How it works
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 scale-110 rounded-full bg-gradient-to-br from-sky-500/30 to-violet-500/20 blur-3xl" />
                <Image
                  src="/cloudoptix-logo.png"
                  alt=""
                  width={320}
                  height={320}
                  className="relative h-auto w-full max-w-[280px] drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>

          <section className="mt-24 grid gap-6 sm:grid-cols-2 lg:mt-32 lg:grid-cols-4">
            {[
              {
                icon: Brain,
                title: 'ML-ranked regions',
                body: 'A trained model scores candidate data centres — not static geography alone.',
              },
              {
                icon: LineChart,
                title: 'Network-aware',
                body: 'Uses load, packet loss, and bandwidth alongside distance for realistic routing.',
              },
              {
                icon: Globe2,
                title: 'Multi-cloud',
                body: 'Compare across AWS, Azure, and GCP-style regions in one ranked list.',
              },
              {
                icon: Shield,
                title: 'Built for startups',
                body: 'No login required — explore placement decisions before you commit infra.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="glass rounded-2xl p-6">
                <Icon className="h-8 w-8 text-cyan-400" strokeWidth={1.5} />
                <h2 className="mt-4 font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
              </div>
            ))}
          </section>

          <section className="mt-20 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-white">Why not “closest DC”?</h2>
            <p className="mt-4 max-w-3xl text-slate-400">
              Closest on a map is not always lowest effective latency. Congestion, loss, and
              available bandwidth change by the hour. CloudOptix is designed for teams who want
              routing decisions that reflect how the network actually behaves — see the full story
              on our{' '}
              <Link href="/how-it-works" className="font-medium text-cyan-400 hover:underline">
                methodology page
              </Link>
              .
            </p>
          </section>
        </main>
      </div>
    </PageShell>
  )
}
