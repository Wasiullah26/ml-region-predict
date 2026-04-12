import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Session snapshot of your latest CloudOptix recommendation.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
