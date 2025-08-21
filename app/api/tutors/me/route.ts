// app/api/tutors/me/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any)?.role
  if (role !== 'TUTOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Return your tutor profile (adjust as needed)
  const userId = (session.user as any).id
  // If you have a Tutor table, fetch it; otherwise return minimal data:
  const tutor = { userId, name: session.user?.name ?? null }

  return NextResponse.json({ data: tutor })
}
