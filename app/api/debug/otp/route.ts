// app/api/debug/otp/route.ts  -- remove in production
import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import type { OtpChallenge } from "@prisma/client"


export async function GET(req: Request) {
  const url = new URL(req.url)
  const email = (url.searchParams.get("email") || "").toLowerCase().trim()
  const reason = url.searchParams.get("reason") || undefined

  const rows = await prisma.otpChallenge.findMany({
    where: { ...(email ? { email } : {}), ...(reason ? { reason } : {}) },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const redacted = rows.map((r: OtpChallenge) => ({
    id: r.id,
    email: r.email,
    reason: r.reason,
    used: r.used,
    expiresAt: r.expiresAt,
    createdAt: r.createdAt,
  }))

  return NextResponse.json({ data: redacted })
}
