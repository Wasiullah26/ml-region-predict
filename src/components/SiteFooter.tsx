import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-white">CloudOptix</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            Intelligent routing across AWS, Azure, and GCP — not just the closest map pin.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-slate-500">Product</span>
            <Link href="/how-it-works" className="text-slate-300 hover:text-white">
              How it works
            </Link>
            <Link href="/optimizer" className="text-slate-300 hover:text-white">
              Optimizer
            </Link>
            <Link href="/dashboard" className="text-slate-300 hover:text-white">
              Dashboard
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-slate-500">Company</span>
            <Link href="/pricing" className="text-slate-300 hover:text-white">
              Pricing
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} CloudOptix. Built for teams deploying on public cloud.
      </div>
    </footer>
  )
}
