import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE) === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
})
export async function sendMail({to, subject, html}:{to:string;subject:string;html:string}){
  const from = process.env.SMTP_FROM || "Ustaad Link <noreply@example.com>"
  await transporter.sendMail({ from, to, subject, html })
}
