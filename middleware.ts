// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow the gate link to set cookie
  if (pathname.startsWith('/admin/enter')) return NextResponse.next()

  // Restrict /auth/admin to those who came via secret link
  if (pathname === '/auth/admin') {
    const hasGate = req.cookies.get('admin_gate')?.value === 'ok'
    if (!hasGate) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // Protect /admin routes (role ADMIN)
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req })
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth', req.url))
    }
    return NextResponse.next()
  }

  // Protect /dashboard routes (role STUDENT or TUTOR)
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req })
    if (!token || !['STUDENT', 'TUTOR', 'ADMIN'].includes(String(token.role))) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Only run on relevant paths
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/auth/admin', '/admin/enter/:path*'],
}
