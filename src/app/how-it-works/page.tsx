import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'How it works',
}

export default function HowItWorksPage() {
  return (
    <PageShell>
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        </div>
        <article className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <h1 className="text-4xl font-bold tracking-tight text-white">How CloudOptix works</h1>
          <p className="mt-4 text-lg text-slate-400">
            A concise overview of what happens between your inputs and a ranked list of public-cloud
            regions.
          </p>

          <div className="mt-12 max-w-none space-y-6">
            <div className="glass rounded-2xl p-6 text-base leading-relaxed text-slate-300">
              <p>
                Our system predicts the most efficient cloud data centre for a given end user at any
                point in time. When someone wants to connect to cloud infrastructure, instead of
                simply routing them to the geographically closest data centre, we take into account
                their location alongside real-time network conditions — specifically{' '}
                <strong className="text-white">network load</strong>,{' '}
                <strong className="text-white">packet loss</strong>, and{' '}
                <strong className="text-white">available bandwidth</strong> — and use a trained{' '}
                <strong className="text-white">LightGBM</strong> classifier to predict which of the
                candidate data centres across <strong className="text-white">AWS</strong>,{' '}
                <strong className="text-white">Azure</strong>, and <strong className="text-white">GCP</strong>{' '}
                will deliver the lowest effective latency and highest reliability for that user at
                that moment.
              </p>
              <p className="mt-4">
                The system returns the recommended data centre together with a confidence score and a
                ranked list of alternatives, enabling intelligent dynamic routing decisions rather
                than static geographic assignment.
              </p>
            </div>

            <h2 className="mt-8 text-2xl font-semibold text-white">Inputs you provide</h2>
            <ul className="mt-6 space-y-4">
              {[
                'Where your users or customers are concentrated (geography hub).',
                'Where you are leaning to deploy workloads first (second hub).',
                'We derive a distance signal (great-circle km) between those hubs, or you can override it.',
                'Network load (0–1), packet loss, and bandwidth (Mbps) to reflect current conditions.',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-14 text-2xl font-semibold text-white">What you get back</h2>
            <ul className="mt-6 space-y-4 text-slate-300">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                A primary recommendation: region name, provider, human-readable location, estimated
                latency, and confidence.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                A full ranking of alternative data centres with scores for failover and architecture
                planning.
              </li>
            </ul>

            <div className="mt-14 flex flex-wrap gap-4">
              <Link
                href="/optimizer"
                className="inline-flex rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-sky-400 hover:to-cyan-300"
              >
                Run the optimizer
              </Link>
              <Link
                href="/"
                className="inline-flex rounded-xl border border-white/15 px-6 py-3 font-medium text-slate-200 hover:bg-white/5"
              >
                Back to home
              </Link>
            </div>
          </div>
        </article>
      </main>
    </PageShell>
  )
}
