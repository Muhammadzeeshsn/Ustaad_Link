// app/lib/mail.ts
// SMTP-only implementation that returns boolean (true on success, false on failure).
// Uses SMTP_FROM from .env and does not throw.

type SendArgs = {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  replyTo?: string
}

const FROM =
  process.env.SMTP_FROM ||
  process.env.MAIL_FROM ||
  'UstaadLink <no-reply@localhost>'

export async function sendMail(args: SendArgs): Promise<boolean> {
  try {
    if (process.env.SMTP_HOST) {
      const nodemailer = await import('nodemailer')
      const tx = nodemailer.createTransport({
        host: process.env.SMTP_HOST!,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || 'false') === 'true',
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      })

      const info = await tx.sendMail({
        from: FROM,
        to: args.to,
        subject: args.subject,
        text: args.text,
        html: args.html,
        replyTo: args.replyTo,
      })

      // Helpful debug line in dev; keep or remove as you like
      if (process.env.NODE_ENV !== 'production') {
        console.log('[mail] sent', { messageId: info.messageId, to: args.to })
      }

      return true
    }

    // No SMTP configured: allow dev to proceed so flows don’t block
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[mail] SMTP not configured; dev-faking send', {
        from: FROM,
        to: args.to,
        subject: args.subject,
      })
      return true
    }

    console.error('[mail] No SMTP provider configured in production.')
    return false
  } catch (err: any) {
    console.error('[mail] Send error:', err?.message || err)
    return false
  }
}
