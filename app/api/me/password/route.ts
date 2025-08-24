// app/api/me/password/route.ts
import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const me = await requireUser()
    const { newPassword } = await req.json().catch(() => ({}))

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: me.id },
      data: { hashedPassword: passwordHash },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed to update password." }, { status })
  }
}
