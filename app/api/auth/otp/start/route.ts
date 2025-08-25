// app/api/auth/otp/start/route.ts
import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/app/lib/prisma"
import { sendMail } from "@/app/lib/mail"

type Reason = "register" | "login" | "reset"

const TTL_MINUTES = 10
const COOLDOWN_SECONDS = 45

const code6 = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0")
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex")

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const rawEmail = (body?.email ?? "") as string
    const reason: Reason = (body?.reason as Reason) || "login"
    const role = (body?.role as "STUDENT" | "TUTOR" | "ADMIN" | undefined) // optional

    const email = rawEmail.trim().toLowerCase()
    if (!email) return NextResponse.json({ error: "EMAIL_REQUIRED" }, { status: 400 })

    // For forgot password, ensure the user exists first (prevents confusing “not found” later)
    if (reason === "reset" && role) {
      const exists = await prisma.user.findFirst({ where: { email, role } })
      if (!exists) return NextResponse.json({ error: "NO_ACCOUNT" }, { status: 404 })
    }

    // cooldown per (email, reason)
    const last = await prisma.otpChallenge.findFirst({
      where: { email, reason },
      orderBy: { createdAt: "desc" },
    })
    const since = last ? (Date.now() - new Date(last.createdAt).getTime()) / 1000 : 999
    if (since < COOLDOWN_SECONDS) {
      return NextResponse.json({ error: "TOO_SOON", remain: Math.ceil(COOLDOWN_SECONDS - since) }, { status: 429 })
    }

    const code = code6()
    const created = await prisma.otpChallenge.create({
      data: {
        email,
        reason,
        codeHash: sha(code),
        used: false,
        expiresAt: new Date(Date.now() + TTL_MINUTES * 60 * 1000),
      },
    })

    await sendMail({
      to: email,
      subject: "Your verification code - UstaadLink",
      text: `Your code is ${code}. It expires in ${TTL_MINUTES} minutes.`,
      html: `<p>Your code is <b style="font-size:18px">${code}</b>. It expires in <b>${TTL_MINUTES} minutes</b>.</p>`,
    })

    return NextResponse.json({ ok: true, challengeId: created.id, cooldown: COOLDOWN_SECONDS })
  } catch (e) {
    console.error("[otp/start] error:", e)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}
