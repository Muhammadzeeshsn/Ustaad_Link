// app/api/auth/check-email/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'

export async function POST(req: Request) {
  const { email, role }: { email: string; role: 'STUDENT' | 'TUTOR' } = await req.json()
  if (!email || !role) return NextResponse.json({ exists: false }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, role: true },
  })

  const exists = !!(user && user.role === role)
  return NextResponse.json({ exists })
}
