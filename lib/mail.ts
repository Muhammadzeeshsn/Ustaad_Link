// lib/mail.ts
import nodemailer from 'nodemailer'

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM,
} = process.env

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: Number(MAIL_PORT ?? 587),
  secure: Number(MAIL_PORT ?? 587) === 465,
  auth: MAIL_USER && MAIL_PASS ? { user: MAIL_USER, pass: MAIL_PASS } : undefined,
})

export async function sendMail(args: { to: string; subject: string; html: string; text?: string }) {
  if (!MAIL_FROM) throw new Error('MAIL_FROM not set')
  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  })
  return info
}
