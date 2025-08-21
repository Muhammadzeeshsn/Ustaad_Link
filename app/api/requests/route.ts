// app/api/requests/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma: PrismaClient = (global as any).__PRISMA__ ?? new PrismaClient()
if (!(global as any).__PRISMA__) (global as any).__PRISMA__ = prisma

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email?.toLowerCase()
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status') // e.g. 'pending_review' for admin

  // Student: return their own requests
  if (user.role === 'STUDENT') {
    const rows = await prisma.request.findMany({
      where: {
        studentId: user.id,
        ...(statusFilter
          ? { status: statusFilter.toUpperCase() as any }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      data: rows.map((r) => ({
        ...r,
        status: r.status.toLowerCase(), // UI expects lower
        // keep type as enum e.g. HIRE_TUTOR (your UI prettifies it)
      })),
    })
  }

  // Admin: allow status filtering, e.g. ?status=pending_review
  if (user.role === 'ADMIN') {
    const where = statusFilter ? { status: statusFilter.toUpperCase() as any } : {}
    const rows = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        createdAt: true,
      },
    })
    return NextResponse.json({
      data: rows.map((r) => ({ ...r, status: r.status.toLowerCase() })),
    })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
