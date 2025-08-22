// app/api/auth/otp/verify/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import crypto from 'crypto'
import type { Prisma } from '@prisma/client'   // ← add this

function hash(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex')
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()
    const reason = String(body.reason || '') as 'register' | 'reset' | 'login'
    const code = String(body.code || '').replace(/\D/g, '')
    const challengeId = String(body.challengeId || '')

    if (!email || !reason || !code || !challengeId) {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }

    const challenge = await prisma.otpChallenge.findFirst({
      where: { id: challengeId, email, reason, used: false },
    })
    if (!challenge) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }

    if (challenge.expiresAt && Date.now() > new Date(challenge.expiresAt).getTime()) {
      return NextResponse.json({ error: 'expired' }, { status: 400 })
    }

    const ok = challenge.codeHash === hash(code)
    if (!ok) {
      await prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      })
      return NextResponse.json({ error: 'invalid_code' }, { status: 400 })
    }

    // mark used
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { used: true },
    })

    if (reason === 'register') {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (!existing) {
        const payload: any = challenge.payload || {}
        const role = (payload.role === 'TUTOR' || payload.role === 'STUDENT') ? payload.role : 'STUDENT'
        const name = typeof payload.name === 'string' ? payload.name : null
        const phone = typeof payload.phone === 'string' ? payload.phone : null
        const hashedPassword = String(payload.hashedPassword || '')

        // Type the transaction client to fix the TS error:
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const user = await tx.user.create({
            data: {
              email,
              hashedPassword,
              role: role as any,        // Prisma enum in your schema
              status: 'ACTIVE' as any,  // Prisma enum in your schema
              name: name || undefined,
              emailVerified: new Date(),
            },
          })

          if (role === 'STUDENT') {
            await tx.studentProfile.create({
              data: {
                userId: user.id,
                name: name || undefined,
                phone: phone || undefined,
              },
            })
          } else {
            await tx.tutorProfile.create({
              data: { userId: user.id },
            })
          }
        })
      }
      return NextResponse.json({ ok: true, created: !existing })
    }

    // login/reset just validate
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
