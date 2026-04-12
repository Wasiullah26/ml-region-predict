import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { Check } from 'lucide-react'

export const metadata = {
  title: 'Pricing',
}

const tiers = [
  {
    name: 'Explore',
    price: 'Free',
    desc: 'Public optimizer and docs — ideal for pitches and architecture reviews.',
    features: ['Live region recommendations', 'Ranked alternatives', 'No login'],
    cta: 'Try optimizer',
    href: '/optimizer',
    highlight: false,
  },
  {
    name: 'Team',
    price: 'Contact',
    desc: 'For startups ready to integrate routing into staging and production.',
    features: [
      'API integration support',
      'Custom SLAs & regions',
      'Security review assistance',
    ],
    cta: 'Talk to us',
    href: '/how-it-works',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'Multi-account, governance, and dedicated inference options.',
    features: ['VPC / private endpoints', 'SSO & audit', 'Dedicated support'],
    cta: 'Contact sales',
    href: '/how-it-works',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <PageShell>
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl flex-1 px-4 py-16 sm:px-6 lg:py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">Pricing</h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Start free on the public optimizer. When you are ready to embed CloudOptix in your
              stack, we will align pricing with your traffic and compliance needs.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-2xl border p-8 ${
                  tier.highlight
                    ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-transparent shadow-lg shadow-cyan-500/10'
                    : 'glass border-white/10'
                }`}
              >
                <h2 className="text-lg font-semibold text-white">{tier.name}</h2>
                <p className="mt-2 text-3xl font-bold text-cyan-300">{tier.price}</p>
                <p className="mt-3 flex-1 text-sm text-slate-400">{tier.desc}</p>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-white hover:from-sky-400 hover:to-cyan-300'
                      : 'border border-white/15 text-white hover:bg-white/5'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </PageShell>
  )
}
