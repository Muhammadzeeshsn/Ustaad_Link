// app/admin/leave/route.ts
import { NextResponse } from 'next/server'
export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL('/auth?admin=1', req.url))
  res.cookies.set('admin-entry', '', { path: '/', maxAge: 0 }) // old cookie
  res.cookies.set('admin-gate', '', { path: '/', maxAge: 0 })  // new cookie (if needed)
  return res
}
