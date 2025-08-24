// app/api/report-error/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sendMail } from "@/lib/mail"

export async function POST(req: Request) {
  try {
    const session = await auth()
    const me = (session?.user as any) || null
    const { message, path, meta } = await req.json().catch(() => ({}))

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL
    if (!ADMIN_EMAIL) {
      return NextResponse.json({ ok: false, error: "ADMIN_EMAIL missing in env." }, { status: 500 })
    }

    const subject = `User error report${path ? ` • ${path}` : ""}`
    const lines = [
      `User: ${me?.email || "Anonymous"} (${me?.id || "-"})`,
      `Path: ${path || "-"}`,
      `Message: ${message || "-"}`,
      `Meta: ${meta ? JSON.stringify(meta, null, 2) : "-"}`,
      `Time: ${new Date().toISOString()}`,
    ]

    await sendMail({
      to: ADMIN_EMAIL,
      subject,
      text: lines.join("\n"),
      html: `<pre>${lines
        .map((l) => String(l).replace(/[<>&]/g, (m) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" } as any)[m]))
        .join("\n")}</pre>`,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed to send report." }, { status: 500 })
  }
}
