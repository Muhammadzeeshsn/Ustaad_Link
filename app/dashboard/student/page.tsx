// app/dashboard/student/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Plus, BookOpen, Users, LogOut, ClipboardList, ChevronRight } from 'lucide-react'
import { fadeUp } from '@/lib/motion'
import { swrFetcher } from '@/lib/swr'   // ← use throwing fetcher

type RequestType = 'HIRE_TUTOR' | 'HIRE_QURAN' | 'PROJECT_HELP' | string
type RequestStatus = 'pending_review' | 'approved' | 'rejected' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | string

type RequestRow = {
  id: string
  title: string
  description: string | null
  type: RequestType
  status: RequestStatus
  createdAt: string
  subject?: string | null
  classLevel?: string | null
}

type StudentProfile = { userId: string; name: string; phone?: string | null; location?: string | null }

const popCard = { initial: { scale: 0.985, opacity: 0 }, animate: { scale: 1, opacity: 1, transition: { duration: 0.25 } } }

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'pending_review': return 'bg-yellow-100 text-yellow-800'
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'assigned': return 'bg-blue-100 text-blue-800'
    case 'in_progress': return 'bg-indigo-100 text-indigo-800'
    case 'completed': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : '')
function computeProfileCompletion(p: StudentProfile | null | undefined): number {
  if (!p) return 0
  const fields = [p.name, p.phone]
  const filled = fields.filter(v => (v ?? '').toString().trim()).length
  const pct = Math.round(((filled / fields.length) * 100) / 10) * 10
  return Math.max(10, Math.min(100, pct))
}
const toLabel = (v: string) => v.replace(/[_-]/g, ' ').replace(/\b\w/g, m => m.toUpperCase())

export default function StudentDashboardPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState<'requests' | 'assignments'>('requests')

  // role-gate
  const { data: session, status } = useSession()
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth'
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'STUDENT') {
      window.location.href = '/dashboard/tutor'
    }
  }, [status, session])

  const { data: meRes, error: meErr, isLoading: meLoading } = useSWR<{ data: StudentProfile }>('/api/students/me', swrFetcher)
  const { data: reqRes, error: reqErr, isLoading: loadingReqs } =
    useSWR<{ data: RequestRow[] }>('/api/requests', swrFetcher)

  useEffect(() => { document.title = 'Student Dashboard | UstaadLink' }, [])
  useEffect(() => { if (meErr) toast({ title: 'Error', description: meErr.message, variant: 'destructive' }) }, [meErr, toast])

  const profile: StudentProfile | null = meRes?.data ?? null
  const requests: RequestRow[] = reqRes?.data ?? []

  const profilePct = useMemo(() => computeProfileCompletion(profile), [profile])
  const activeAssignments = useMemo(() => requests.filter(r => ['assigned', 'in_progress'].includes(r.status)), [requests])

  async function handleSignOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/'
    } catch {
      toast({ title: 'Error signing out', description: 'Please try again.' })
    }
  }

  if (meLoading) {
    return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</div>
  }
  if (meErr || !profile) {
    return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Could not load profile.</div>
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <motion.header variants={fadeUp} initial="hidden" animate="visible" className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl ring-2 ring-white/25 bg-primary-foreground/10">
              <span className="font-semibold">{(profile?.name?.[0] || 'U').toUpperCase()}</span>
            </div>
            <div>
              <div className="text-xs/4 text-primary-foreground/80">Welcome back</div>
              <div className="text-sm font-semibold">{profile?.name || 'Student'}</div>
            </div>
            <Badge variant="secondary" className="ml-2 bg-white/15 text-white">Student</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button>
          </div>
        </div>
      </motion.header>

      <main className="container pb-28 pt-6 md:pb-12 md:pt-8">
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div variants={popCard} initial="initial" animate="animate" className="transform-gpu">
            <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  Profile <span className="text-sm font-normal text-primary">{profilePct}% Complete</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16">
                    <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                      <path d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32" fill="none" stroke="currentColor" className="text-muted" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
                      <path d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32" fill="none" stroke="currentColor" className="text-primary" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${profilePct}, 100`} />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-sm font-semibold">{profilePct}%</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Profile completeness</div>
                    <div className="text-xs text-muted-foreground">Add phone number to reach 100%</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" onClick={() => (window.location.href = '/dashboard/student/profile')}>
                    Edit Profile <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <ActionCard title="Post Request" desc="Find a tutor quickly" onClick={() => (window.location.href = '/dashboard/student/new-request')} icon={<Plus className="h-7 w-7" />} />
              <ActionCard title="Track Requests" desc="Monitor progress" onClick={() => setTab('requests')} icon={<ClipboardList className="h-7 w-7" />} />
              <ActionCard title="Active Tutoring" desc="Your sessions" onClick={() => setTab('assignments')} icon={<BookOpen className="h-7 w-7" />} />
              <ActionCard title="Browse Tutors" desc="Find experts" onClick={() => (window.location.href = '/teachers')} icon={<Users className="h-7 w-7" />} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="requests">My Requests</TabsTrigger>
              <TabsTrigger value="assignments">Active Tutoring</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">My Requests</h2>
                <Button onClick={() => (window.location.href = '/dashboard/student/new-request')}>
                  <Plus className="mr-2 h-4 w-4" /> New Request
                </Button>
              </div>

              {loadingReqs ? (
                <SkeletonList />
              ) : reqErr ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{(reqErr as any)?.message || 'Failed to load requests.'}</div>
              ) : requests.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {requests.map((r) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="transform-gpu">
                      <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{r.title}</CardTitle>
                            <div className="flex gap-2">
                              <Badge className={statusBadgeClasses(r.status)}>{toLabel(r.status)}</Badge>
                              <Badge variant="outline">{toLabel(r.type)}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4 text-sm text-muted-foreground">{r.description || '—'}</p>
                          <div className="text-xs text-muted-foreground">Posted {formatDate(r.createdAt)}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyStateCard
                  title="No requests yet"
                  description="Create your first request to find tutors"
                  action={<Button onClick={() => (window.location.href = '/dashboard/student/new-request')}>Create Request</Button>}
                />
              )}
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <h2 className="text-xl font-semibold">Active Tutoring Sessions</h2>
              {loadingReqs ? (
                <SkeletonList />
              ) : (
                <EmptyStateCard title="No active tutoring sessions" description="Your approved/assigned requests will appear here" />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function ActionCard({ title, desc, icon, onClick }: { title: string; desc: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl" onClick={onClick}>
        <CardContent className="flex flex-col items-center p-4 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function EmptyStateCard({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <Card className="rounded-2xl border bg-card/50 shadow-sm">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  )
}

function SkeletonList() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
            <div className="mt-3 h-3 w-full rounded bg-muted" />
            <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
            <div className="mt-4 h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
