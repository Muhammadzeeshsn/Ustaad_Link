// app/auth/admin/page.tsx
'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminAuthPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', {
      email,
      password,
      role: 'ADMIN',
      redirect: false,
      callbackUrl: '/admin',
    })
    setLoading(false)
    if (res?.ok) router.push('/admin')
    else alert(res?.error || 'Invalid credentials')
  }

  return (
    <div className="wrap py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border bg-card p-6">
        <h1 className="text-xl font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Restricted access.</p>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
