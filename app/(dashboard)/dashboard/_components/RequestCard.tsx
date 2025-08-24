// RequestCard.tsx
'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

export function RequestCard({ r }: { r: {
  id: string, title: string, description?: string|null, type: string, status: string, createdAt: string
}}) {
  const Type = r.type.replace('_',' ')
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}>
      <Card className="overflow-hidden rounded-2xl border shadow-sm hover:shadow-lg transition-all">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{r.title}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-muted">{Type}</Badge>
              <Badge>{r.status.replace('_',' ')}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">{r.description || '—'}</p>
          <div className="mt-3 text-xs text-muted-foreground">Posted {new Date(r.createdAt).toLocaleDateString()}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
