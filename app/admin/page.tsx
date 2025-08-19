'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Shield, FileText, Settings, LogOut, Check, RefreshCw, ClipboardList } from 'lucide-react'

type Me = { id: string; email: string; role?: 'admin' | 'student' | 'tutor' | string }
type RequestRow = {
  id: string
  title: string
  details?: string | null
  category?: string | null
  status: string
  createdAt?: string | null
  created_at?: string | null
}
type ApplicationRow = {
  id: string
  requestId: string
  tutorId: string
  coverLetter?: string | null
  price?: number | null
  status: string
  createdAt?: string | null
  request?: { title?: string | null; category?: string | null } | null
}

const fetcher = (u: string) => fetch(u, { credentials: 'include' }).then(r => r.json())

export default function AdminPanel() {
  const { toast } = useToast()

  // who am I?
  const { data: meRes } = useSWR<Me | { data?: Me; user?: Me }>('/api/me', fetcher)

  const me: Me | undefined =
    (meRes && 'data' in meRes ? meRes.data : (meRes as Me)) as Me | undefined
  const isAdmin = (me?.role ?? '').toLowerCase() === 'admin'

  useEffect(() => {
    if (!me) return
    if (!isAdmin) window.location.href = '/'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, isAdmin])

  // pending requests (awaiting admin approval)
  const {
    data: reqRes,
    isLoading: loadingReqs,
    mutate: refetchReqs,
    error: reqErr,
  } = useSWR<{ data: RequestRow[] } | { error: string }>(
    '/api/requests?status=pending_review',
    fetcher,
    { shouldRetryOnError: false }
  )

  const requests =
    reqRes && 'data' in reqRes ? (reqRes.data ?? []) : []

  // proposals/applications pending review
  const {
    data: appRes,
    isLoading: loadingApps,
    mutate: refetchApps,
  } = useSWR<{ data: ApplicationRow[] } | { error: string }>(
    '/api/applications?status=pending_review',
    fetcher,
    { shouldRetryOnError: false }
  )

  const applications =
    appRes && 'data' in appRes ? (appRes.data ?? []) : []

  async function approveRequest(id: string) {
    try {
      const res = await fetch(`/api/requests/${id}/approve`, { method: 'POST', credentials: 'include' })
      if (!res.ok) throw new Error('Approve failed')
      toast({ title: 'Request approved', description: 'Now visible to tutors.' })
      refetchReqs()
    } catch (e: any) {
      toast({ title: 'Could not approve', description: e?.message ?? 'Please try again.', variant: 'destructive' })
    }
  }

  // Approve a proposal by assigning the tutor to the request
  async function approveProposal(requestId: string, tutorId: string) {
    try {
      const res = await fetch(`/api/requests/${requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tutorId }),
      })
      if (!res.ok) throw new Error('Assign failed')
      toast({ title: 'Proposal approved', description: 'Assignment created.' })
      refetchApps()
    } catch (e: any) {
      toast({ title: 'Could not approve proposal', description: e?.message ?? 'Please try again.', variant: 'destructive' })
    }
  }

  async function signOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      window.location.href = '/'
    } catch {
      toast({ title: 'Error signing out', description: 'Please try again.' })
    }
  }

  if (!me) {
    return <div className="min-h-screen bg-background grid place-items-center text-muted-foreground">Loading…</div>
  }

  if (!isAdmin) {
    return <div className="min-h-screen bg-background grid place-items-center text-muted-foreground">Redirecting…</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
            <Badge variant="destructive">RESTRICTED ACCESS</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center p-6">
              <FileText className="mr-4 h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{requests.length}</div>
                <div className="text-sm text-muted-foreground">Pending Requests</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <ClipboardList className="mr-4 h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{applications.length}</div>
                <div className="text-sm text-muted-foreground">Pending Proposals</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <Settings className="mr-4 h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">Active</div>
                <div className="text-sm text-muted-foreground">System Status</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests">Student Requests</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
          </TabsList>

          {/* Requests */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Pending Student Requests</h2>
              <Button variant="outline" size="sm" onClick={() => refetchReqs()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>

            {loadingReqs ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Loading…</CardContent></Card>
            ) : reqErr ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Failed to load.</CardContent></Card>
            ) : requests.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No pending requests.</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {requests.map((r) => (
                  <Card key={r.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{r.title}</CardTitle>
                          <p className="text-muted-foreground">{r.category?.replace(/_/g, ' ')}</p>
                          <Badge variant="outline" className="mt-2">Pending Review</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => approveRequest(r.id)}>
                            <Check className="mr-2 h-4 w-4" /> Approve
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{r.details}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Submitted {formatDate(r.createdAt ?? r.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Proposals */}
          <TabsContent value="proposals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Pending Proposals</h2>
              <Button variant="outline" size="sm" onClick={() => refetchApps()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>

            {loadingApps ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Loading…</CardContent></Card>
            ) : applications.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No pending proposals.</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {applications.map((p) => (
                  <Card key={p.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {p.request?.title ?? 'Request'}
                          </CardTitle>
                          <p className="text-muted-foreground">
                            Tutor: {p.tutorId}
                          </p>
                          {p.request?.category && (
                            <Badge variant="outline" className="mt-2">
                              {p.request.category.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveProposal(p.requestId, p.tutorId)}>
                            <Check className="mr-2 h-4 w-4" />
                            Approve & Assign
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {p.coverLetter && <p className="text-sm text-muted-foreground">{p.coverLetter}</p>}
                      {p.price != null && (
                        <p className="mt-2 text-sm font-semibold text-green-700">Proposed Price: PKR {p.price}</p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Submitted {formatDate(p.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function formatDate(iso?: string | null) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString() } catch { return '' }
}
