// app/lib/mail.ts
import nodemailer from "nodemailer"

export type SendArgs = {
  to: string
  subject: string
  html: string
  text?: string
}

export type SendMailResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

let transporter: nodemailer.Transporter | null = null

function bool(v: string | undefined) {
  if (!v) return undefined
  const s = v.toLowerCase()
  return s === "1" || s === "true" || s === "yes"
}

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter

  // Accept both SMTP_* and MAIL_* keys
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST
  const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 0)
  const user = process.env.SMTP_USER || process.env.MAIL_USER
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS
  const secure =
    bool(process.env.SMTP_SECURE) ?? bool(process.env.MAIL_SECURE) ?? (port === 465)

  if (!host || !port || !user || !pass) {
    throw new Error(
      "SMTP env not set. Need HOST, PORT, USER, PASS (either SMTP_* or MAIL_*)."
    )
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure, // 465 => true, 587 => false(+STARTTLS)
    auth: { user, pass },
  })

  // Small non-secret log (helps confirm correct env keys)
  console.log(`[mail] host=${host} port=${port} secure=${secure}`)

  return transporter
}

export async function sendMail(args: SendArgs): Promise<SendMailResult> {
  const from = process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.SMTP_USER || process.env.MAIL_USER
  if (!from) return { ok: false, error: "FROM not configured (SMTP_FROM or MAIL_FROM)" }

  try {
    const info = await getTransporter().sendMail({ from, ...args })
    return { ok: true, id: String((info as any).messageId ?? "") }
  } catch (err: any) {
    const detail = err?.response || err?.message || String(err)
    console.error("[sendMail] Failed:", detail)
    return { ok: false, error: detail }
  }
}
