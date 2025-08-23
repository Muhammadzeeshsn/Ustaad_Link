// app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function UserDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/auth')

  const role = (session.user as any).role as 'STUDENT' | 'TUTOR' | 'ADMIN'
  return (
    <div className="wrap py-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Signed in as {session.user.email} — role: {role}</p>

      {role === 'STUDENT' && (
        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold">Student actions</h2>
          <ul className="list-disc pl-5 text-sm">
            <li><Link href="/requests">Create a request</Link></li>
            <li><Link href="/courses">Browse courses</Link></li>
          </ul>
        </div>
      )}

      {role === 'TUTOR' && (
        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold">Tutor actions</h2>
          <ul className="list-disc pl-5 text-sm">
            <li><Link href="/requests">View public requests</Link></li>
            <li><Link href="/dashboard/applications">My applications</Link></li>
          </ul>
        </div>
      )}

      {role === 'ADMIN' && (
        <div className="mt-6">
          <p>Go to <Link href="/admin" className="text-primary underline">Admin panel</Link></p>
        </div>
      )}
    </div>
  )
}
