// app/(dashboard)/dashboard/layout.tsx
import type { Metadata } from 'next'
import '../../globals.css'          // ✅ important: two levels up
import Providers from '../../providers'
import { Toaster } from '@/components/ui/toaster'
import Topbar from './_components/Topbar'

export const metadata: Metadata = {
  title: 'Dashboard • UstaadLink',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>
          {/* No public Navbar/Footer here */}
          <Topbar />
          <main className="min-h-[80vh]">{children}</main>
          <footer className="border-t bg-muted/30">
            <div className="container py-4 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} UstaadLink · <a href="/about" className="underline">About</a> · <a href="/contact" className="underline">Contact</a> · <a href="/blog" className="underline">Blog</a>
            </div>
          </footer>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
