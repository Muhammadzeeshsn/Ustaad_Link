// app/(dashboard)/dashboard/layout.tsx
import type { Metadata } from 'next'
import '../../globals.css'           // ✅ correct relative path from (dashboard)/dashboard
import Providers from '../../providers'
import Topbar from './_components/Topbar'

export const metadata: Metadata = {
  title: 'Dashboard • UstaadLink',
  description: 'Student dashboard',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Topbar /> {/* ✅ all interactive handlers live in this CLIENT component */}
          <main className="min-h-[calc(100vh-3.25rem)] bg-gradient-to-b from-primary/5 via-background to-background">
            {children}
          </main>
          <footer className="sticky bottom-0 w-full border-t bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-xs text-muted-foreground">
              <span>© {new Date().getFullYear()} UstaadLink. All rights reserved.</span>
              <nav className="flex items-center gap-3">
                <a href="/about" className="hover:underline">About</a>
                <a href="/contact" className="hover:underline">Contact</a>
                <a href="/requests" className="hover:underline">Requests</a>
              </nav>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
