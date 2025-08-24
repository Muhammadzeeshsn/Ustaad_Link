// app/(site)/layout.tsx
import type { Metadata } from 'next'
import '../globals.css'
import Providers from '../providers'
import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'UstaadLink',
  description: 'Find tutors and learning help',
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
