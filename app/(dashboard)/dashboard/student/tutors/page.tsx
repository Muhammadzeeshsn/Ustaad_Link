'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

const fetcher = async (url: string) => {
  const r = await fetch(url)
  if (!r.ok) return { data: [] } // avoid hard error
  const ct = r.headers.get('content-type') || ''
  if (!ct.includes('application/json')) return { data: [] }
  return r.json()
}

export default function TutorsPane() {
  const [q, setQ] = useState('')
  const { data, isLoading, mutate } = useSWR<{ data: any[] }>(`/api/tutors${q ? `?q=${encodeURIComponent(q)}` : ''}`, fetcher)
  const tutors = data?.data ?? []

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle>Browse Tutors</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input placeholder="Search by name, subject, city" value={q} onChange={(e) => setQ(e.target.value)} className="h-11" />
          <Button className="h-11" onClick={() => mutate()}>Search</Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-sm text-muted-foreground">Loading tutors…</div>
          ) : (tutors.length === 0) ? (
            <div className="col-span-full rounded-2xl border bg-card/50 p-5 text-sm text-muted-foreground">
              <p className="mb-2">No tutors matched your search. Don’t worry—only tutors who opted to be visible are shown here.</p>
              <p>
                You can still <Link href="/dashboard/student/new-request" className="text-primary underline underline-offset-4">post a request</Link> and we’ll arrange the best tutor according to your needs.
              </p>
            </div>
          ) : tutors.map((t: any) => (
            <Card key={t.id} className="rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-sm font-semibold">{(t.name || 'U')[0]}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold">{t.name}</h3>
                      {t.subject && <Badge>{t.subject}</Badge>}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{t.city || '—'} {t.rating ? `• ⭐ ${Number(t.rating).toFixed(1)}` : ''}</p>
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
  )
}
