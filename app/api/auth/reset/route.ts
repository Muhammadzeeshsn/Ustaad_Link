// app/api/auth/reset/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = (body?.email ?? '').toString().trim().toLowerCase()
    const newPassword = (body?.newPassword ?? '').toString()
    const challengeId = (body?.challengeId ?? '').toString()

    if (!email || !newPassword || !challengeId) {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'weak_password' }, { status: 400 })
    }

    // OTP must have been used (verified) and be for reset
    const ch = await prisma.otpChallenge.findUnique({ where: { id: challengeId } })
    if (!ch || ch.email.toLowerCase() !== email || ch.reason !== 'reset' || ch.used !== true) {
      return NextResponse.json({ error: 'no_verify' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: user.id }, data: { hashedPassword: hashed } })
    await prisma.otpChallenge.delete({ where: { id: ch.id } })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
