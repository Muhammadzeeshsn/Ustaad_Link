import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sendMail } from "@/app/lib/mail" // <- your boolean-returning helper

export async function POST(req: Request) {
  try {
    const { message, page, pageUrl, detail } = await req.json().catch(() => ({}))
    if (!message || !String(message).trim()) {
      return NextResponse.json({ ok: false, error: "Message required." }, { status: 400 })
    }

    const session = await auth()
    const user = session?.user as any | null

    const ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown"
    const ua = req.headers.get("user-agent") || "unknown"
    const referer = req.headers.get("referer") || undefined

    const to = process.env.REPORT_EMAIL || ""
    if (!to) return NextResponse.json({ ok: false, error: "Report email not configured." }, { status: 500 })

    const lines = [
      "New error report from UstaadLink",
      "",
      `Page: ${pageUrl || page || referer || "unknown"}`,
      `IP: ${ip}`,
      `User-Agent: ${ua}`,
      user ? `User: ${user.id} • ${user.email || "-"} • role: ${user.role || "-"}` : "User: not logged in",
      "",
      "User message:",
      String(message).trim(),
      "",
      "--- Technical details (hidden from user) ---",
      detail ? String(detail) : "(none)",
    ]

    const ok = await sendMail({
      to,
      subject: "[UstaadLink] Error report",
      text: lines.join("\n"),
      html:
        `<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; line-height: 1.5">` +
        lines.map((l) => l.replace(/&/g, "&amp;").replace(/</g, "&lt;")).join("\n") +
        `</pre>`,
    })

    if (!ok) return NextResponse.json({ ok: false, error: "Failed to send report." }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to send report." }, { status: 500 })
  }
}
