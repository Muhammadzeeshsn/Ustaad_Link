// app/(dashboard)/dashboard/layout.tsx
import type { ReactNode } from "react"
import Topbar from "./_components/Topbar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
      <footer className="mt-12 border-t bg-muted/20">
        <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} UstaadLink — Dashboard
        </div>
      </footer>
    </div>
  )
}
