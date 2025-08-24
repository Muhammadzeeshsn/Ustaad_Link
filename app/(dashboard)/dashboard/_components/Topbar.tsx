'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bell, ChevronDown, LogOut, User, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const r = await fetch('/api/notifications?unread=1')
        const j = await r.json().catch(() => null)
        if (!ignore && j?.data) setCount(j.data.length || 0)
      } catch {}
    })()
    return () => { ignore = true }
  }, [])

  const item = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + '/')
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

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/15 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/student" className="text-sm font-semibold tracking-wide">
              UstaadLink • Student
            </Link>
            <nav className="hidden gap-1 sm:flex">
              {item('/dashboard/student', 'Home')}
              {item('/dashboard/student/new-request', 'New Request')}
              {item('/dashboard/student/tutors', 'Browse Tutors')}
            </nav>
          </div>

          <div className="relative flex items-center gap-2">
            {/* bell overlay trigger */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setNotifOpen(v => !v)}
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                  {count}
                </span>
              )}
            </Button>

            {/* profile dropdown */}
            <Button variant="secondary" size="sm" onClick={() => setMenuOpen(v => !v)} className="gap-2">
              <User className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>

            {menuOpen && (
              <Card className="absolute right-0 top-10 z-50 w-48 overflow-hidden border shadow-lg">
                <Link href="/dashboard/student/profile" className="block px-3 py-2 text-sm hover:bg-muted">
                  <span className="inline-flex items-center gap-2"><User className="h-4 w-4" /> View / Edit Profile</span>
                </Link>
                <Link href="/dashboard/student/profile#password" className="block px-3 py-2 text-sm hover:bg-muted">
                  <span className="inline-flex items-center gap-2"><KeyRound className="h-4 w-4" /> Update Password</span>
                </Link>
                <button onClick={logout} className="block w-full px-3 py-2 text-left text-sm hover:bg-muted">
                  <span className="inline-flex items-center gap-2"><LogOut className="h-4 w-4" /> Sign out</span>
                </button>
              </Card>
            )}
          </div>
        </div>
      </header>

      {/* notifications overlay */}
      {notifOpen && <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setNotifOpen(false)} />}
      {notifOpen && (
        <div className="fixed right-3 top-12 z-50 w-80">
          <Card className="max-h-[70vh] overflow-auto border bg-background shadow-xl">
            <div className="border-b p-3 text-sm font-semibold">Notifications</div>
            <NotificationsList />
          </Card>
        </div>
      )}
    </>
  )
}

function NotificationsList() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const r = await fetch('/api/notifications')
        const j = await r.json().catch(() => null)
        if (!ignore && j?.data) setItems(j.data)
      } catch {}
    })()
    return () => { ignore = true }
  }, [])
  if (!items.length) return <div className="p-3 text-sm text-muted-foreground">You have no notifications yet.</div>
  return (
    <ul className="divide-y">
      {items.map(n => (
        <li key={n.id} className="p-3">
          <div className="text-sm font-medium">{n.title}</div>
          {n.body && <div className="text-xs text-muted-foreground">{n.body}</div>}
        </li>
      ))}
    </ul>
  )
}
