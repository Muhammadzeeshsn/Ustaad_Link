// app/admin/enter/[slug]/page.tsx
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'

export default function AdminGate({ params }: { params: { slug: string } }) {
  const expected = process.env.ADMIN_ENTRY_SLUG
  if (!expected || params.slug !== expected) return notFound()

  // Set a short-lived cookie that allows access to /auth/admin
  cookies().set('admin_gate', 'ok', { httpOnly: true, path: '/', maxAge: 60 * 10 }) // 10 minutes
  redirect('/auth/admin')
}
