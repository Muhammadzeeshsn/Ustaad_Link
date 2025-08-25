// components/layout/DashboardLayout.tsx
import * as React from "react"

// Dashboard shell WITHOUT the public Navbar/Footer.
// Keep this minimal; each dashboard page can render its own header.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        {children}
      </div>
    </div>
  )
}
