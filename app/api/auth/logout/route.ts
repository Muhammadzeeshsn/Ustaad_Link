// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  // If you already do extra logout work (DB, audit, etc.), keep it.
  const res = NextResponse.json({ ok: true })

  // Clear both the new and any legacy gate cookies
  res.cookies.set('admin-gate', '', { path: '/', maxAge: 0 })
  res.cookies.set('admin-entry', '', { path: '/', maxAge: 0 })

  // If you want to be extra safe, you can also clear NextAuth cookies by name
  // (depends on your NextAuth session strategy). Usually not needed if you call
  // next-auth's signOut client-side, but harmless:
  // res.cookies.set('next-auth.session-token', '', { path: '/', maxAge: 0 })
  // res.cookies.set('__Secure-next-auth.session-token', '', { path: '/', maxAge: 0 })

  return res
}
