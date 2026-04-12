'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const nav = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/optimizer', label: 'Optimizer' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pricing', label: 'Pricing' },
] as const

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-white" onClick={() => setOpen(false)}>
          <Image src="/cloudoptix-logo.png" alt="CloudOptix" width={36} height={36} className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">CloudOptix</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                pathname === href
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/optimizer"
            className="hidden rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-sky-400 hover:to-cyan-300 sm:inline-block"
          >
            Try optimizer
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-300 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 text-sm ${
                  pathname === href ? 'bg-white/10 text-white' : 'text-slate-300'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/optimizer"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 py-3 text-center text-sm font-semibold text-white"
            >
              Try optimizer
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
