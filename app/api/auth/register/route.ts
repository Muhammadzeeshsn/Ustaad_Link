import { prisma } from "@/app/lib/db"
import { hash } from "argon2"
import { z } from "zod"
import { createEmailToken } from "@/app/lib/tokens"
import { sendMail } from "@/app/lib/mail"

const Register = z.object({ role: z.enum(["student","tutor"]), name: z.string().min(2), email: z.string().email(), password: z.string().min(8) })

export async function POST(req: Request){
  const body = await req.json()
  const { role, name, email, password } = Register.parse(body)
  const lower = email.toLowerCase()
  const exists = await prisma.user.findUnique({ where: { email: lower } })
  if (exists) return Response.json({ error: "Email already exists" }, { status: 400 })
  const user = await prisma.user.create({ data: { email: lower, hashedPassword: await hash(password), role, status: "pending" } })
  if (role === "student") await prisma.studentProfile.create({ data: { userId: user.id, name } })
  else await prisma.tutorProfile.create({ data: { userId: user.id, name, subjects: [] } })
  const token = await createEmailToken(user.id, "verify")
  const link = `${process.env.SITE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`
  await sendMail({ to: lower, subject: "Verify your email — Ustaad Link", html: `<p>Hi ${name},</p><p>Please verify your email:</p><p><a href="${link}">Verify Email</a></p><p>${link}</p>` })
  return Response.json({ data: { ok: true } })
}
