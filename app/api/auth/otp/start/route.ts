import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/app/lib/prisma"
import { sendMail } from "@/app/lib/mail"

function code6() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0")
}
function sha(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex")
}

// POST /api/auth/otp/start
// body: { email: string, reason: "login" | "register" | string }
export async function POST(req: Request) {
  try {
    const { email: rawEmail, reason: rawReason } = await req.json().catch(() => ({}))
    const email = String(rawEmail || "").trim().toLowerCase()
    const reason = String(rawReason || "login").trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Cooldown: 45s since last OTP for same email+reason
    const last = await prisma.otpChallenge.findFirst({
      where: { email, reason },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    })

    if (last) {
      const since = (Date.now() - new Date(last.createdAt).getTime()) / 1000
      if (since < 45) {
        return NextResponse.json({ error: "Please wait before requesting another code." }, { status: 429 })
      }
    }

    const code = code6()
    await prisma.otpChallenge.create({
      data: {
        email,
        reason,
        codeHash: sha(code),
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
      },
    })

    const ok = await sendMail({
      to: email,
      subject: "Your verification code – UstaadLink",
      text: `Your code is ${code}. It expires in 2 minutes.`,
      html: `<p>Your code is <b style="font-size:18px">${code}</b>. It expires in <b>2 minutes</b>.</p>`,
    })

    if (!ok) {
      return NextResponse.json({ error: "Could not send verification code." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[otp/start] error:", err?.message || err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
