// app/api/auth/otp/start/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'
import { sendMail } from '@/app/lib/mail'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const OTP_TTL_MS = 2 * 60 * 1000   // 2 minutes
const RESEND_COOLDOWN_MS = 45 * 1000

function hash(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex')
}

function sixDigit() {
  // 000000..999999, always 6 chars
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()
    const reason = String(body.reason || '') as 'register' | 'reset' | 'login'
    const role = String(body.role || '') // 'STUDENT' | 'TUTOR' (optional for reset/login)
    const payload = body.payload || null // signup payload

    if (!email || !reason) {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }

    // Cooldown: block if there is a not-yet-expired challenge created recently
    const last = await prisma.otpChallenge.findFirst({
      where: { email, reason, used: false },
      orderBy: { createdAt: 'desc' },
    })

    if (last) {
      const since = Date.now() - new Date(last.createdAt).getTime()
      if (since < RESEND_COOLDOWN_MS) {
        const remain = Math.ceil((RESEND_COOLDOWN_MS - since) / 1000)
        return NextResponse.json({ error: 'cooldown', remain }, { status: 429 })
      }
    }

    // For signup: if user already exists, short-circuit
    if (reason === 'register') {
      const exists = await prisma.user.findUnique({ where: { email } })
      if (exists) {
        return NextResponse.json({ error: 'exists' }, { status: 409 })
      }
    }

    // Generate code & hash
    const code = sixDigit()
    const codeHash = hash(code)
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    // Build safe payload for register
    let safePayload: any = null
    if (reason === 'register' && payload) {
      const name = typeof payload.name === 'string' ? payload.name : null
      const phone = typeof payload.phone === 'string' ? payload.phone : null
      const r = typeof payload.role === 'string' ? payload.role : role
      const pw = String(payload.password || '')
      const hashedPassword = await bcrypt.hash(pw, 10)
      safePayload = { name, phone, role: r, hashedPassword }
    }

    const created = await prisma.otpChallenge.create({
      data: {
        email,
        reason,
        codeHash,
        expiresAt,
        used: false,
        payload: safePayload, // null for reset/login
      },
      select: { id: true, email: true, reason: true, expiresAt: true },
    })

    // Send the email
    const html = `
      <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;">
        <h2>UstaadLink Verification</h2>
        <p>Your verification code is:</p>
        <p style="font-size:24px; font-weight:700; letter-spacing:4px">${code}</p>
        <p>This code expires in 2 minutes.</p>
      </div>
    `
    const mailRes = await sendMail({ to: email, subject: 'Your verification code', html })
    if (!mailRes.ok) {
      // If email failed, delete the challenge we just created
      await prisma.otpChallenge.delete({ where: { id: created.id } })
      return NextResponse.json({ error: 'mail_fail' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      challengeId: created.id,
      cooldown: Math.ceil(RESEND_COOLDOWN_MS / 1000),
    })
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
