
// =====================================================
// 3) app/dashboard/student/tutors/page.tsx  (NEW)
// =====================================================
'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function TutorsBrowserPage() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<any[]>([])

  async function fetchTutors(query: string) {
    setLoading(true)
    try {
      const r = await fetch(`/api/tutors${query ? `?q=${encodeURIComponent(query)}` : ''}`)
      const j = await r.json()
      setRows(j.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchTutors('') }, [])

  return (
    <div className="container pb-20 pt-6">
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <CardTitle>Browse Tutors (In‑Portal)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input placeholder="Search by name, subject, city" value={q} onChange={(e) => setQ(e.target.value)} className="h-11" />
            <Button className="h-11" onClick={() => fetchTutors(q)}>Search</Button>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-sm text-muted-foreground">Loading tutors…</div>
            ) : rows.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground">No tutors found. Try a different query.</p>
            ) : rows.map((t: any) => (
              <Card key={t.id} className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-sm font-semibold">
                      {(t.name || 'U')[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-semibold">{t.name}</h3>
                        {t.subject && <Badge>{t.subject}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{t.city || '—'} {t.rating ? `• ⭐ ${Number(t.rating).toFixed(1)}` : ''}</p>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t.hourly ? `Hourly: Rs ${Number(t.hourly).toLocaleString()}` : '—'}</p>
                    <Button size="sm">View Profile</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
