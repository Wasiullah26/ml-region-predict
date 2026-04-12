import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Optimizer',
  description: 'Get a ranked cloud region recommendation from CloudOptix.',
}

export default function OptimizerLayout({ children }: { children: React.ReactNode }) {
  return children
}
