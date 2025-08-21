// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow the entry route (it renders the secret form)
  if (pathname.startsWith('/admin/enter')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const expected = process.env.ADMIN_ENTRY_SLUG ?? 'sltech'
    const gate = req.cookies.get('admin-gate')?.value

    // If new cookie is present and valid, allow
    if (gate === expected) {
      return NextResponse.next()
    }

    // Otherwise allow ADMIN role via NextAuth JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const role = (((token as any)?.role ?? '') as string).toUpperCase()
    if (role === 'ADMIN') {
      return NextResponse.next()
    }

    // Block → send to auth
    const url = req.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('admin', '1')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
