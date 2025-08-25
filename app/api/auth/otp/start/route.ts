// app/api/auth/otp/start/route.ts
import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/app/lib/prisma"
import { sendMail } from "@/app/lib/mail"

const COOLDOWN_SECONDS = 45
const OTP_TTL_MINUTES = 10

type RoleUpper = "STUDENT" | "TUTOR" | "ADMIN"
const toRole = (x?: string | null): RoleUpper =>
  (String(x).toUpperCase() as RoleUpper) === "TUTOR"
    ? "TUTOR"
    : (String(x).toUpperCase() as RoleUpper) === "ADMIN"
    ? "ADMIN"
    : "STUDENT"

function sha(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex")
}

function sixDigits() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || "").trim().toLowerCase()
    const reason = String(body.reason || "").trim() // "register" | "login" | "reset"
    const role: RoleUpper = toRole(body.role || body?.payload?.role)
    const phoneRaw: string | undefined = body?.payload?.phone ? String(body.payload.phone) : undefined

    if (!email || !reason) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 })
    }

    // ---------- 1) PRE‑FLIGHT: block if email already exists ----------
    if (reason === "register") {
const existingByEmail = await prisma.user.findFirst({ where: { email } })
if (existingByEmail) {
  return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 })
}      if (existingByEmail) {
        return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 })
      }

      // ---------- 2) PRE‑FLIGHT: block if phone already linked ----------
      if (phoneRaw) {
        // Check both possible profile tables and surface the owner email if found
        const existingSP = await prisma.studentProfile.findFirst({
          where: { phone: phoneRaw },
          include: { user: { select: { email: true } } },
        }).catch(() => null)

        const existingTP = await prisma.tutorProfile.findFirst({
          where: { phone: phoneRaw },
          include: { user: { select: { email: true } } },
        }).catch(() => null)

        const ownerEmail = existingSP?.user?.email || existingTP?.user?.email || null
        if (ownerEmail) {
          return NextResponse.json(
            { error: "PHONE_EXISTS", email: ownerEmail },
            { status: 409 }
          )
        }
      }
    }

    // ---------- 3) COOLDOWN / THROTTLE ----------
    // Find the most recent challenge for this email+reason and enforce a simple cooldown
    const last = await prisma.otpChallenge.findFirst({
      where: { email, reason },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    })

    if (last) {
      const deltaSec = Math.floor((Date.now() - last.createdAt.getTime()) / 1000)
      const remain = COOLDOWN_SECONDS - deltaSec
      if (remain > 0) {
        return NextResponse.json({ error: "COOLDOWN", remain }, { status: 429 })
      }
    }

    // ---------- 4) Create a fresh OTP ----------
    const code = sixDigits()
    const codeHash = sha(code)
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

    const created = await prisma.otpChallenge.create({
      data: { email, reason, codeHash, expiresAt, used: false },
      select: { id: true },
    })

    // ---------- 5) Send email ----------
    const subject =
      reason === "register"
        ? "Verify your email — UstaadLink"
        : reason === "reset"
        ? "Password reset code — UstaadLink"
        : "Login verification code — UstaadLink"

    const html = `
      <p>Use this code to continue on UstaadLink:</p>
      <p style="font-size:22px;font-weight:700;letter-spacing:3px">${code}</p>
      <p>This code expires in ${OTP_TTL_MINUTES} minutes.</p>
    `
    await sendMail({ to: email, subject, html }).catch(() => null)

    return NextResponse.json({
      ok: true,
      challengeId: created.id,
      cooldown: COOLDOWN_SECONDS,
    })
  } catch (e) {
    console.error("[otp/start] error:", e)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
