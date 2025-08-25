// app/api/auth/reset/route.ts
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || "").trim().toLowerCase()
    const newPassword = String(body?.newPassword || "")
    const challengeId = String(body?.challengeId || "")

    if (!email || !newPassword || !challengeId) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "WEAK_PASSWORD" }, { status: 400 })
    }

    // The UI calls /api/auth/otp/verify before this, so we require that OTP to be marked used.
    const otp = await prisma.otpChallenge.findFirst({
      where: { id: challengeId, email, reason: "reset", used: true, expiresAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } },
    })
    if (!otp) return NextResponse.json({ error: "OTP_NOT_VERIFIED" }, { status: 400 })

    // Update password for both roles if you want, or require role. Here we try both STUDENT and TUTOR.
    const hashed = await bcrypt.hash(newPassword, 10)

    const updated =
      (await prisma.user.updateMany({
        where: { email },
        data: { hashedPassword: hashed },
      })) || { count: 0 }

    if (!updated.count) return NextResponse.json({ error: "ACCOUNT_NOT_FOUND" }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[auth/reset] error:", e)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}
