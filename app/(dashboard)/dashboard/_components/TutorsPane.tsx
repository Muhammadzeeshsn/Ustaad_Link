'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TutorsPane() {
  const [q, setQ] = useState('')

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle>Browse Tutors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name, subject, city"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            className="flex-1"
          />
          <Button onClick={()=>{/* call your search here with q */}}>Search</Button>
        </div>

        <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
          No tutors matched your search. Don’t worry—only tutors who opted to be visible are shown here.
          You can still{' '}
          <Link href="/dashboard/student/new-request" className="text-primary underline">post a request</Link>
          {' '}and we’ll arrange the best tutor according to your needs.
        </div>

        {/* results grid (when you wire up search) */}
        {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"> ... </div> */}
      </CardContent>
    </Card>
  )
}
