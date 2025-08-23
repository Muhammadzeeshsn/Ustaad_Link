// app/dashboard/tutor/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { fadeUp, stagger, slideCard } from '@/lib/motion'
import { swrFetcher } from '@/lib/swr'

import {
  Users, Calendar, Star, Award, Bell, LogOut, ClipboardList, Home, Briefcase, User, CheckCircle, RefreshCw,
} from 'lucide-react'

/* ───────────── Types (aligned with our API) ───────────── */

type TutorProfile = {
  userId: string
  name: string | null
  bio?: string | null
  subjects?: string[] | null
}

type RequestRow = {
  id: string
  title: string
  description?: string | null
  type: string
  status: string
  createdAt?: string | null
  budgetMin?: number | null
  budgetMax?: number | null
}

type ApplicationRow = {
  id: string
  requestId: string
  coverLetter?: string | null
  price?: number | null
  status: string
  createdAt?: string | null
  request?: { title: string; type: string } | null
}

/* ───────────── Utils ───────────── */

const popCard = {
  initial: { scale: 0.985, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.25 } },
}

function statusBadgeClasses(status: string) {
  const s = status.toLowerCase()
  if (s.includes('pending')) return 'bg-yellow-100 text-yellow-800'
  if (s.includes('approved')) return 'bg-green-100 text-green-800'
  if (s.includes('rejected')) return 'bg-red-100 text-red-800'
  if (s.includes('assigned') || s.includes('accepted')) return 'bg-blue-100 text-blue-800'
  if (s.includes('completed')) return 'bg-purple-100 text-purple-800'
  return 'bg-gray-100 text-gray-800'
}
const toLabel = (v: string) => v.replace(/[_-]/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString() : '')

/* ───────────── Page ───────────── */

export default function TutorDashboardPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState<'requests' | 'proposals'>('requests')

  // Use throwing SWR fetcher (sets error on 401/403)
  const { data: meRes, error: meErr, isLoading: meLoading } =
    useSWR<{ data: TutorProfile } | { error: string }>('/api/tutors/me', swrFetcher)

  const {
    data: openRes,
    error: openErr,
    isLoading: loadingOpen,
    mutate: refetchOpen,
  } = useSWR<{ data: RequestRow[] } | { error: string }>(
    '/api/tutor/requests/open',
    swrFetcher
  )

  const {
    data: appsRes,
    error: appsErr,
    isLoading: loadingApps,
    mutate: refetchApps,
  } = useSWR<{ data: ApplicationRow[] } | { error: string }>(
    '/api/applications',
    swrFetcher
  )

  const profile: TutorProfile | null =
    (meRes && 'data' in meRes ? meRes.data : null) ?? null
  const openRequests: RequestRow[] =
    (openRes && 'data' in openRes ? openRes.data : []) ?? []
  const applications: ApplicationRow[] =
    (appsRes && 'data' in appsRes ? appsRes.data : []) ?? []

  useEffect(() => {
    document.title = 'Tutor Dashboard | UstaadLink'
  }, [])

  // NOTE: removed auto-redirect on meErr to avoid portal teardown during nav

  async function handleSignOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/'
    } catch {
      toast({ title: 'Error signing out', description: 'Please try again.' })
    }
  }

  async function applyToRequest(requestId: string) {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          requestId,
          coverLetter: 'I would like to help with this request.',
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to apply')
      toast({ title: 'Application submitted', description: 'Pending admin review.' })
      refetchApps()
    } catch (e: any) {
      toast({ title: 'Could not apply', description: e?.message || 'Please try again.', variant: 'destructive' })
    }
  }

  // Unauthorized / session missing (401/403) → show a friendly card, no auto-redirect
  if (meErr || (meRes && 'error' in meRes)) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Card className="max-w-md rounded-2xl">
          <CardContent className="py-10 text-center">
            <div className="mb-2 text-lg font-semibold">Session required</div>
            <p className="text-sm text-muted-foreground">
              Please sign in as a <strong>tutor</strong> to access the dashboard.
            </p>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => (window.location.href = '/auth?callbackUrl=/dashboard/tutor')}>
                Go to sign in
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // True loading state while the /me request is in flight
  if (meLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Header */}
      <motion.header variants={fadeUp} initial="hidden" animate="visible" className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl ring-2 ring-white/25 bg-primary-foreground/10">
              <span className="font-semibold">{(profile?.name?.[0] || 'T').toUpperCase()}</span>
            </div>
            <div>
              <div className="text-xs/4 text-primary-foreground/80">Welcome</div>
              <div className="text-sm font-semibold">{profile?.name || 'Tutor'}</div>
            </div>
            <Badge variant="secondary" className="ml-2 bg-white/15 text-white">Tutor</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <main className="container pb-28 pt-6 md:pb-12 md:pt-8">
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard icon={<Users className="h-7 w-7" />} title="Open Requests" value={openRequests.length} />
          <StatCard icon={<ClipboardList className="h-7 w-7" />} title="My Applications" value={applications.length} tone="amber" />
          <StatCard icon={<Star className="h-7 w-7" />} title="Avg. Rating" value="—" tone="yellow" />
          <StatCard icon={<Award className="h-7 w-7" />} title="This Month" value="—" tone="violet" />
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="requests">Available</TabsTrigger>
              <TabsTrigger value="proposals">Applications</TabsTrigger>
            </TabsList>

            {/* Available Requests */}
            <TabsContent value="requests" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Available Requests</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetchOpen()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>

              {loadingOpen ? (
                <SkeletonGrid />
              ) : openRequests.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {openRequests.map((r) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{r.title}</CardTitle>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge variant="outline">{toLabel(r.type)}</Badge>
                                <Badge className={statusBadgeClasses(r.status)}>{toLabel(r.status)}</Badge>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => applyToRequest(r.id)}>
                              Apply Now
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4 text-sm text-muted-foreground">{r.description || '—'}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Posted {formatDate(r.createdAt)}</span>
                            {r.budgetMin != null || r.budgetMax != null ? (
                              <span className="font-semibold">
                                PKR {r.budgetMin?.toLocaleString?.() ?? '—'}
                                {r.budgetMax != null ? ` – ${r.budgetMax.toLocaleString?.()}` : ''}
                              </span>
                            ) : <span />}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyBlock
                  title="No requests right now"
                  desc="Check back soon; new requests are approved by admin first."
                  actionLabel="Refresh"
                  onAction={() => refetchOpen()}
                />
              )}
            </TabsContent>

            {/* My Applications */}
            <TabsContent value="proposals" className="space-y-4">
              <h2 className="text-xl font-semibold">My Applications</h2>

              {loadingApps ? (
                <SkeletonGrid />
              ) : applications.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {applications.map((p) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{p.request?.title ?? 'Request'}</CardTitle>
                            <Badge className={statusBadgeClasses(p.status)}>{toLabel(p.status)}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {p.coverLetter && (
                            <p className="mb-2 text-sm text-muted-foreground">{p.coverLetter}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Applied {formatDate(p.createdAt)}</span>
                            {p.price != null && <span className="font-semibold">PKR {p.price}</span>}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyBlock
                  title="No applications yet"
                  desc="Find a request that fits you and apply."
                  actionLabel="Browse requests"
                  onAction={() => setTab('requests')}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          <BottomItem label="Home" icon={<Home className="h-5 w-5" />} active={tab === 'requests'} onClick={() => setTab('requests')} />
          <BottomItem label="Apps" icon={<Briefcase className="h-5 w-5" />} active={tab === 'proposals'} onClick={() => setTab('proposals')} />
          <BottomItem label="Teachers" icon={<Users className="h-5 w-5" />} active={false} onClick={() => (window.location.href = '/teachers')} />
          <BottomItem label="Profile" icon={<User className="h-5 w-5" />} active={false} onClick={() => (window.location.href = '/dashboard/tutor')} />
        </div>
      </nav>
    </div>
  )
}

/* ───────────── Small UI helpers ───────────── */

function StatCard({
  icon, title, value, tone = 'primary',
}: {
  icon: React.ReactNode
  title: string
  value: number | string
  tone?: 'primary' | 'amber' | 'yellow' | 'violet'
}) {
  const toneClass =
    tone === 'amber'
      ? 'bg-amber-50 text-amber-700 ring-amber-100'
      : tone === 'yellow'
      ? 'bg-yellow-50 text-yellow-700 ring-yellow-100'
      : tone === 'violet'
      ? 'bg-violet-50 text-violet-700 ring-violet-100'
      : 'bg-primary/10 text-primary ring-primary/15'

  return (
    <motion.div variants={popCard} initial="initial" animate="animate" className="transform-gpu">
      <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
        <CardContent className="flex items-center gap-4 p-6">
          <div className={`inline-flex rounded-xl p-2 ring-1 ${toneClass}`}>{icon}</div>
          <div>
            <div className="text-sm text-muted-foreground">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function EmptyBlock({
  title, desc, actionLabel, onAction,
}: {
  title: string
  desc: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="py-12 text-center">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div className="text-lg font-semibold">{title}</div>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{desc}</p>
        <div className="mt-4">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="h-40 w-full bg-muted" />
        </div>
      ))}
    </div>
  )
}

function BottomItem({
  label, icon, active, onClick,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-2.5 text-xs ${
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <div className="grid h-7 w-7 place-items-center rounded-full">{icon}</div>
      <span>{label}</span>
    </button>
  )
}
