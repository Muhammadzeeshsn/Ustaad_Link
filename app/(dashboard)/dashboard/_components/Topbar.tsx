'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Bell, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    try {
      setSigningOut(true)
      // Use your existing logout endpoint (no <form> + onSubmit in server)
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } finally {
      setSigningOut(false)
    }
  }

  const item = (href: string, label: string) => {
    const active = pathname.startsWith(href)
    return (
      <Link
        href={href}
        className={`rounded-md px-3 py-1.5 text-sm transition ${
          active ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/15 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/student" className="text-sm font-semibold tracking-wide">
            UstaadLink • Student
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {item('/dashboard/student', 'Home')}
            {item('/dashboard/student/new-request', 'New Request')}
            {item('/dashboard/student/profile', 'Profile')}
            {item('/dashboard/student/tutors', 'Browse Tutors')}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => router.push('/dashboard/student/notifications')}
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">0</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{signingOut ? 'Signing out…' : 'Sign Out'}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
