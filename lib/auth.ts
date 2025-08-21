// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

// --- Prisma singleton (safe in dev) ---
const prisma: PrismaClient = (global as any).__PRISMA__ ?? new PrismaClient()
if (!(global as any).__PRISMA__) (global as any).__PRISMA__ = prisma

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }, // 'STUDENT' or 'TUTOR'
      },
      async authorize(credentials) {
        const email = (credentials?.email || '').trim().toLowerCase()
        const password = credentials?.password || ''
        const requestedRole = (credentials?.role || 'STUDENT') as Role

        if (!email || !password) throw new Error('Enter email and password')

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) throw new Error('No account found for this email')

        const ok = await bcrypt.compare(password, user.hashedPassword)
        if (!ok) throw new Error('Invalid email or password')

        if (user.role !== requestedRole) {
          throw new Error(
            `This account is ${user.role}. Switch to the ${user.role.toLowerCase()} tab to continue.`
          )
        }

        return { id: user.id, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        // token.email already provided by NextAuth when user present
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        // keep email synced, avoid name/image fields (not in schema)
        session.user.email = (token.email || session.user.email || null) as any
      }
      return session
    },
  },
  pages: {
    signIn: '/auth',
  },
}
