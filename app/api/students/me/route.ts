// app/api/students/me/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma: PrismaClient = (global as any).__PRISMA__ ?? new PrismaClient()
if (!(global as any).__PRISMA__) (global as any).__PRISMA__ = prisma

export async function GET() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email?.toLowerCase()
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      student: {
        select: { userId: true, name: true, phone: true, location: true },
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Ensure shape matches your dashboard types
  const profile = user.student ?? { userId: user.id, name: '', phone: null, location: null }
  return NextResponse.json({ data: profile })
}
