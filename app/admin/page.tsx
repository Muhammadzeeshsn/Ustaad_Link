// app/admin/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const role = (((session?.user as any)?.role ?? '') as string).toUpperCase()

  const expected = process.env.ADMIN_ENTRY_SLUG ?? 'sltech'
  const gate = cookies().get('admin-gate')?.value

  const allowed = role === 'ADMIN' || gate === expected
  if (!allowed) {
    redirect('/auth?admin=1')
  }

  return <AdminClient />
}
