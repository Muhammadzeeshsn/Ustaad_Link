// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email.trim().toLowerCase()

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        // ⚠️ change this if your hashed password field is named differently
        const hashed =
          (user as any).passwordHash ??
          (user as any).hashedPassword ??
          (user as any).password

        const ok = hashed ? await bcrypt.compare(credentials.password, hashed) : false
        if (!ok) return null

        // Return minimal info; include role so we can persist it
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: (user as any).role, // should be 'TUTOR' | 'STUDENT' | 'ADMIN'
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.name = (user as any).name ?? token.name
        token.id = (user as any).id ?? token.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = (token as any).role
        ;(session.user as any).id = (token as any).id
        session.user.name = (token as any).name ?? session.user.name
      }
      return session
    },
  },
  pages: { signIn: '/auth' },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
