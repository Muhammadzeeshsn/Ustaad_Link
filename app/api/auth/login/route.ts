import { prisma } from "@/app/lib/db"
import { verify } from "argon2"
import { z } from "zod"
import { signSession } from "@/app/lib/jwt"
import { NextResponse } from "next/server"
const Login = z.object({ email: z.string().email(), password: z.string().min(8) })
export async function POST(req: Request){
  const b = await req.json(); const { email, password } = Login.parse(b)
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return Response.json({ error: "Invalid credentials" }, { status: 401 })
  if (user.status !== "active") return Response.json({ error: "Email not verified" }, { status: 403 })
  const ok = await verify(user.hashedPassword, password)
  if (!ok) return Response.json({ error: "Invalid credentials" }, { status: 401 })
  const token = await signSession({ uid: user.id, role: user.role as any })
  const res = NextResponse.json({ data: { role: user.role } })
  res.cookies.set("ul_session", token, { httpOnly: true, sameSite: "lax", secure: true, path: "/" })
  return res
}
