// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient, Role, UserStatus, TutorStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma: PrismaClient = (global as any).__PRISMA__ ?? new PrismaClient()
if (!(global as any).__PRISMA__) (global as any).__PRISMA__ = prisma

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const role = (body.role || 'STUDENT') as Role
    const name = (body.name || '').toString().trim()
    const phone = (body.phone || '').toString().trim() || null
    const email = (body.email || '').toString().trim().toLowerCase()
    const password = (body.password || '').toString()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    if (!['STUDENT', 'TUTOR'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword: hashed,
        role,
        status: UserStatus.PENDING,
        ...(role === 'STUDENT'
          ? {
              student: {
                create: {
                  name: name || null,
                  phone,
                },
              },
            }
          : {
              tutor: {
                create: {
                  name: name || null,
                  bio: null,
                  subjects: [],
                  experienceYears: null,
                  status: TutorStatus.PENDING,
                },
              },
            }),
      },
      select: { id: true, email: true, role: true },
    })

    // You can trigger a verification email here if desired.

    return NextResponse.json({ ok: true, user })
  } catch (e: any) {
    console.error('register error:', e)
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
