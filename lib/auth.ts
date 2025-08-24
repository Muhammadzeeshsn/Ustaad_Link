// lib/auth.ts
import { getServerSession } from "next-auth"
import type { Session } from "next-auth"

// IMPORTANT: This import must point to the app router auth route.
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function auth(): Promise<Session | null> {
  return getServerSession(authOptions)
}

/**
 * Use this in API routes that need the logged-in user.
 * It throws a 401-style error you can surface as JSON.
 */
export async function requireUser() {
  const session = await auth()
  const user = (session?.user as any) || null
  if (!user?.id) {
    const err = new Error("UNAUTHORIZED")
    ;(err as any).status = 401
    throw err
  }
  return user as { id: string; email?: string; role?: string }
}
