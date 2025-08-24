// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/app/providers'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'UstaadLink',
  description: 'Find trusted tutors & Quran teachers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>

        {/* stable mount point for toast portal (harmless if unused) */}
        <div id="toast-root" />
      </body>
    </html>
  )
}
