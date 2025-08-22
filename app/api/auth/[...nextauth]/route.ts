// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendMail } from "@/lib/mail"

type RoleUpper = "STUDENT" | "TUTOR" | "ADMIN"

function code6() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0")
}
function sha(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex")
}
const toUpperRole = (r: string | null | undefined): RoleUpper =>
  (String(r).toUpperCase() as RoleUpper) === "TUTOR" ? "TUTOR" : (String(r).toUpperCase() as RoleUpper) === "ADMIN" ? "ADMIN" : "STUDENT"

const authHandler = NextAuth({
  pages: {
    signIn: "/auth",
  },
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(creds) {
        const email = (creds?.email ?? "").toLowerCase().trim()
        const password = String(creds?.password ?? "")
        const role = toUpperRole(creds?.role)

        if (!email || !password) return null

        // Throttle row (composite unique by [email, role])
        const now = new Date()
        const throttle = await prisma.loginThrottle.findUnique({
          where: { email_role: { email, role } } as any,
        }).catch(() => null)

        // If locked, require a recent USED login OTP (set by /api/auth/otp/verify)
        if (throttle?.lockedUntil && now < throttle.lockedUntil) {
          const recent = await prisma.otpChallenge.findFirst({
            where: {
              email,
              reason: "login",
              used: true,
              createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
            },
            orderBy: { createdAt: "desc" },
          })
          if (!recent) {
            // create a login OTP if cooldown allows
            const last = await prisma.otpChallenge.findFirst({
              where: { email, reason: "login" },
              orderBy: { createdAt: "desc" },
            })
            const since = last ? (Date.now() - new Date(last.createdAt).getTime()) / 1000 : 999
            if (since > 45) {
              const code = code6()
              await prisma.otpChallenge.create({
                data: {
                  email,
                  reason: "login",
                  codeHash: sha(code),
                  expiresAt: new Date(Date.now() + 2 * 60 * 1000),
                },
              })
              await sendMail({
                to: email,
                subject: "Login verification code - UstaadLink",
                text: `Your code is ${code}. It expires in 2 minutes.`,
                html: `<p>Your code is <b style="font-size:18px">${code}</b>. It expires in <b>2 minutes</b>.</p>`,
              })
            }
            throw new Error("OTP_REQUIRED")
          }
        }

        const user = await prisma.user.findFirst({ where: { email, role } as any })
        if (!user) return null

        const ok = await bcrypt.compare(password, user.hashedPassword)
        if (!ok) {
          // increment count
          const updated = await prisma.loginThrottle
            .upsert({
              where: { email_role: { email, role } } as any,
              create: { email, role: role as any, count: 1, lastAttemptAt: now },
              update: { count: { increment: 1 }, lastAttemptAt: now },
            })
            .catch(() => null)

          const newCount = (updated?.count ?? 0) + 1
          if (newCount >= 3) {
            // lock for 10 minutes
            await prisma.loginThrottle.update({
              where: { email_role: { email, role } } as any,
              data: { lockedUntil: new Date(Date.now() + 10 * 60 * 1000) },
            }).catch(() => {})
            // send OTP (respect cooldown)
            const last = await prisma.otpChallenge.findFirst({
              where: { email, reason: "login" },
              orderBy: { createdAt: "desc" },
            })
            const since = last ? (Date.now() - new Date(last.createdAt).getTime()) / 1000 : 999
            if (since > 45) {
              const code = code6()
              await prisma.otpChallenge.create({
                data: {
                  email,
                  reason: "login",
                  codeHash: sha(code),
                  expiresAt: new Date(Date.now() + 2 * 60 * 1000),
                },
              })
              await sendMail({
                to: email,
                subject: "Login verification code - UstaadLink",
                text: `Your code is ${code}. It expires in 2 minutes.`,
                html: `<p>Your code is <b style="font-size:18px">${code}</b>. It expires in <b>2 minutes</b>.</p>`,
              })
            }
            throw new Error("OTP_REQUIRED")
          }
          return null
        }

        // password correct; if locked, still require a used OTP in last 10 min
        if (throttle?.lockedUntil && now < throttle.lockedUntil) {
          const recent = await prisma.otpChallenge.findFirst({
            where: {
              email,
              reason: "login",
              used: true,
              createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
            },
            orderBy: { createdAt: "desc" },
          })
          if (!recent) throw new Error("OTP_REQUIRED")
        }

        // success: clear throttle
        await prisma.loginThrottle.deleteMany({ where: { email, role } as any }).catch(() => {})

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          role: user.role as RoleUpper,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).id = token.id
      }
      return session
    },
  },
})

export const GET = authHandler
export const POST = authHandler
