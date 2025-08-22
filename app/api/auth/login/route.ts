// app/api/auth/login/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const OTP_COOKIE = "login_otp_ok"

function readGrant() {
  const c = cookies().get(OTP_COOKIE)?.value
  if (!c) return null
  try { return JSON.parse(Buffer.from(c, "base64url").toString("utf8")) as { email: string; role: string; exp: number } }
  catch { return null }
}

function writeGrant(email: string, role: string, ttlSec: number) {
  const payload = { email, role, exp: Date.now() + ttlSec * 1000 }
  cookies().set(OTP_COOKIE, Buffer.from(JSON.stringify(payload)).toString("base64url"), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: ttlSec,
  })
}

function clearGrant() {
  cookies().set(OTP_COOKIE, "", { path: "/", maxAge: 0 })
}

export async function POST(req: Request) {
  const { email, password, role } = await req.json().catch(() => ({}))
  const emailN = String(email || "").toLowerCase().trim()
  const roleU = String(role || "").toUpperCase()

  if (!emailN || !password || !roleU) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }

  // ensure throttle row exists
  let throttle = await prisma.loginThrottle.findFirst({ where: { email: emailN, role: roleU as any } })
  if (!throttle) {
    throttle = await prisma.loginThrottle.create({ data: { email: emailN, role: roleU as any } })
  }

  const user = await prisma.user.findFirst({ where: { email: emailN, role: roleU as any } })
  const okPassword = !!user && (await bcrypt.compare(password, user.hashedPassword).catch(() => false))

  // Wrong password flow: increment & respond
  if (!okPassword) {
    const updated = await prisma.loginThrottle.update({
      where: { id: throttle.id },
      data: { count: { increment: 1 }, lastAttemptAt: new Date() },
    })
    const remaining = Math.max(0, 3 - updated.count)
    // Tell client how many tries left; only *suggest* OTP after 3 fails (BUT do not require until a correct password comes next)
    return NextResponse.json({
      ok: false,
      wrong: true,
      remaining,
      otpGateActive: updated.count >= 3,
    })
  }

  // Correct password: if 3+ wrongs previously, require OTP unless a valid OTP grant exists
  const grant = readGrant()
  const gateActive = throttle.count >= 3
  const grantValid =
    !!grant &&
    grant.email === emailN &&
    grant.role === roleU &&
    Date.now() < Number(grant.exp)

  if (gateActive && !grantValid) {
    // Ask UI to show OTP-for-login. Do NOT sign in yet.
    return NextResponse.json({ ok: false, otp_required: true })
  }

  // Login allowed: reset throttle, clear grant, let UI proceed to signIn('credentials')
  await prisma.loginThrottle.update({ where: { id: throttle.id }, data: { count: 0, lockedUntil: null } })
  clearGrant()
  return NextResponse.json({ ok: true })
}
