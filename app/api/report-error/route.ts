// app/api/report-error/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sendMail } from "@/lib/mail"

export async function POST(req: Request) {
  try {
    const { message, page } = await req.json().catch(() => ({}))
    if (!message || !String(message).trim()) {
      return NextResponse.json({ ok: false, error: "Message required." }, { status: 400 })
    }

    const session = await auth()
    const user = session?.user as any | null

    // Try to derive IP (works locally and behind common proxies)
    const ip =
      (req.headers.get("x-forwarded-for") || "")
        .split(",")[0]
        .trim() ||
      req.headers.get("x-real-ip") ||
      "unknown"

    const adminTo = process.env.ADMIN_EMAIL || ""
    if (!adminTo) {
      return NextResponse.json({ ok: false, error: "Admin email not configured." }, { status: 500 })
    }

    const lines = [
      `New error report from UstaadLink`,
      ``,
      `Page: ${page || "unknown"}`,
      `IP: ${ip}`,
      user
        ? `User: ${user.id} • ${user.email || "-"} • role: ${user.role || "-"}`
        : `User: not logged in`,
      ``,
      `Message:`,
      String(message).trim(),
    ]

    await sendMail({
      to: adminTo,
      subject: "[UstaadLink] Error report",
      text: lines.join("\n"),
      html: `<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; line-height: 1.5">${lines
        .map((l) => l.replace(/&/g, "&amp;").replace(/</g, "&lt;"))
        .join("\n")}</pre>`,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to send report." }, { status: 500 })
  }
}
