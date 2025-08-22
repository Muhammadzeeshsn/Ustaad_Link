// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/app/lib/db'
import bcrypt from 'bcryptjs'

function fromB64url(s: string) { return Buffer.from(s, 'base64url').toString('utf8') }

export async function POST(req: Request) {
  const { password }: { password: string } = await req.json()
  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'weak' }, { status: 400 })
  }

  const grant = cookies().get('reset_grant')?.value
  if (!grant) return NextResponse.json({ error: 'no_grant' }, { status: 400 })

  let parsed: any
  try {
    parsed = JSON.parse(fromB64url(grant))
  } catch { return NextResponse.json({ error: 'invalid_grant' }, { status: 400 }) }

  if (!parsed?.email || Date.now() > Number(parsed.exp)) {
    cookies().set('reset_grant', '', { path: '/', maxAge: 0 })
    return NextResponse.json({ error: 'grant_expired' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.updateMany({
    where: { email: parsed.email.toLowerCase() },
    data: { hashedPassword: hashed },
  })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('reset_grant', '', { path: '/', maxAge: 0 })
  return res
}
