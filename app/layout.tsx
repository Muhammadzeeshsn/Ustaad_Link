// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'UstaadLink',
  description: 'Find trusted tutors & Quran teachers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
          <Toaster />
          <Footer />
        </Providers>

        {/* stable mount point for toast portal (harmless if unused) */}
        <div id="toast-root" />
      </body>
    </html>
  )
}
