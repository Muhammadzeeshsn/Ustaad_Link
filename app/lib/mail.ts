// app/lib/mail.ts
import nodemailer from 'nodemailer'

export async function sendMail(args: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  const { to, subject, html, text } = args

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER as string,
      pass: process.env.SMTP_PASS as string,
    },
  })

  await transporter.sendMail({
    from: process.env.MAIL_FROM || (process.env.SMTP_USER as string),
    to,
    subject,
    html,
    text,
  })
}
