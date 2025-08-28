import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT ?? 587),
  secure: String(SMTP_SECURE ?? "").toLowerCase() === "true" || Number(SMTP_PORT) === 465,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

export async function sendMail(args: { to: string; subject: string; html: string; text?: string }) {
  if (!SMTP_FROM) throw new Error("SMTP_FROM not set");
  return transporter.sendMail({
    from: SMTP_FROM,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  });
}
