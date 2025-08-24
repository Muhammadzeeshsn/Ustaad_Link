import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/app/lib/prisma"

function sha(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex")
}

// POST /api/auth/otp/verify
// body: { email: string, code: string, reason: "login" | "register" | string }
export async function POST(req: Request) {
  try {
    const { email: rawEmail, code: rawCode, reason: rawReason } = await req.json().catch(() => ({}))
    const email = String(rawEmail || "").trim().toLowerCase()
    const code = String(rawCode || "").trim()
    const reason = String(rawReason || "login").trim().toLowerCase()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    const codeHash = sha(code)
    const now = new Date()

    // Find most recent unused, unexpired OTP for this email+reason matching code
    const challenge = await prisma.otpChallenge.findFirst({
      where: {
        email,
        reason,
        used: false,
        expiresAt: { gte: now },
        codeHash,
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    })

    if (!challenge) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { used: true },
    })

    // Important for your login throttle logic:
    // The login flow checks for a *recent USED* OTP to bypass the lock.
    // Marking used=true above is what enables that.

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[otp/verify] error:", err?.message || err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
