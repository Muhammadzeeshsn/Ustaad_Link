// app/api/auth/otp/verify/route.ts
import { NextResponse } from "next/server"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"
import type { Prisma } from "@prisma/client"


function sha(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex")
}

type RoleUpper = "STUDENT" | "TUTOR" | "ADMIN"
const toRole = (x?: string | null): RoleUpper =>
  (String(x).toUpperCase() as RoleUpper) === "TUTOR"
    ? "TUTOR"
    : (String(x).toUpperCase() as RoleUpper) === "ADMIN"
    ? "ADMIN"
    : "STUDENT"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || "").trim().toLowerCase()
    const code = String(body.code || "").trim()
    const reason = String(body.reason || "").trim() // "register" | "login" | "reset"
    const challengeId = body.challengeId ? String(body.challengeId) : null

    if (!email || !/^\d{6}$/.test(code) || !reason) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 })
    }

    const now = new Date()
    const otp = await prisma.otpChallenge.findFirst({
      where: {
        email,
        reason,
        used: false,
        expiresAt: { gt: now },
        ...(challengeId ? { id: challengeId } : {}),
      },
      orderBy: { createdAt: "desc" },
    })
    if (!otp) return NextResponse.json({ error: "OTP_NOT_FOUND_OR_EXPIRED" }, { status: 400 })
    if (otp.codeHash !== sha(code)) return NextResponse.json({ error: "invalid_code" }, { status: 400 })

    // Do all side effects atomically; mark OTP used only if all succeeds.
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (reason === "register") {
        const payload = body.payload || {}
        const name: string = (payload.name ?? "").trim()
        const password: string = String(payload.password || "")
        const role: RoleUpper = toRole(payload.role)

        // create only if not exists
        const existing = await tx.user.findFirst({ where: { email, role } })
        if (!existing) {
          if (!password || password.length < 6) throw new Error("password_required")
          const hashed = await bcrypt.hash(password, 10)
          await tx.user.create({
            data: {
              email,
              name: name || null,
              role,
              hashedPassword: hashed,
              status: "ACTIVE",
              emailVerified: new Date(),
              image: null,
              // NOTE: Do NOT include `phone` here — your User model doesn’t have it.
              // If you want to store phone, add it to StudentProfile/TutorProfile later.
            } as any,
          })
        } else if (!existing.emailVerified) {
          await tx.user.update({
            where: { id: existing.id },
            data: { emailVerified: new Date(), status: "ACTIVE" },
          })
        }
      }

      // (login/reset) have no extra side effects here

      // mark used last
      await tx.otpChallenge.update({
        where: { id: otp.id },
        data: { used: true },
      })
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[otp/verify] error:", e)
    const msg = String(e?.message || "")
    if (msg === "password_required") {
      return NextResponse.json({ error: "password_required" }, { status: 400 })
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
