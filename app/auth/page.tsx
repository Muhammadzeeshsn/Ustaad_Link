'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { BrandButton } from '@/components/brand/BrandButton'
import { useToast } from '@/hooks/use-toast'
import { Mail, Lock, User, Phone } from 'lucide-react'

import { fadeUp, stagger, slideCard } from '@/lib/motion'


type Role = 'student' | 'tutor'
type Mode = 'login' | 'signup'



const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

export default function AuthPage() {
  const [role, setRole] = useState<Role>('student')
  const [mode, setMode] = useState<Mode>('signup')
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')

  const canSubmit = useMemo(() => {
    if (!emailOk(email) || password.length < 6) return false
    if (mode === 'signup' && name.trim().length < 2) return false
    return true
  }, [email, password, mode, name])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, name, email, password, phone }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error ?? 'Registration failed')
        toast({ title: 'Verify your email', description: 'We’ve sent a verification link to your inbox.' })
        setMode('login')
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error ?? 'Login failed')
        router.push(role === 'student' ? '/dashboard/student' : '/dashboard/tutor')
      }
    } catch (err: any) {
      toast({ title: 'Authentication error', description: err?.message ?? 'Please try again.', variant: 'destructive' })
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-muted/30 text-foreground">
      <section className="container px-4 py-10 md:py-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto grid max-w-5xl gap-6 rounded-2xl border bg-card shadow-sm md:grid-cols-2"
        >
          <aside className="hidden rounded-l-2xl bg-primary/95 p-8 text-primary-foreground md:block">
            <div className="mx-auto max-w-sm">
              <h1 className="text-3xl font-extrabold">Welcome to Ustaad Link</h1>
              <p className="mt-3 text-white/90">
                One login page. Choose Student or Tutor. Admin moderates everything.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-white/95">
                <li>• Admin-approved matching</li>
                <li>• Track request status end-to-end</li>
                <li>• Email verification built-in</li>
              </ul>
            </div>
          </aside>

          <div className="rounded-r-2xl bg-card p-6 md:p-8">
            <Tabs value={role} onValueChange={(v) => setRole(v as Role)} className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="student" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Student
                </TabsTrigger>
                <TabsTrigger value="tutor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Tutor
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{mode === 'signup' ? 'Create account' : 'Log in'}</h2>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                    onClick={() => setMode((m) => (m === 'signup' ? 'login' : 'signup'))}
                  >
                    {mode === 'signup' ? 'Have an account? Log in' : 'New here? Sign up'}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.form
                    key={`${role}-${mode}`}
                    variants={slideCard}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onSubmit={onSubmit}
                    className="space-y-4"
                  >
                    {mode === 'signup' && (
                      <>
                        <label className="block text-sm font-medium">
                          Full name
                          <div className="relative mt-1">
                            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                            <User className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </label>

                        <label className="block text-sm font-medium">
                          Phone (optional)
                          <div className="relative mt-1">
                            <Input placeholder="+92 3xx xxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            <Phone className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </label>
                      </>
                    )}

                    <label className="block text-sm font-medium">
                      Email
                      <div className="relative mt-1">
                        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <Mail className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </label>

                    <label className="block text-sm font-medium">
                      Password
                      <div className="relative mt-1">
                        <Input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <Lock className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </label>

                    <div className="pt-2">
                      <BrandButton type="submit" disabled={!canSubmit}>
                        {mode === 'signup' ? `Create ${role} account` : 'Log in'}
                      </BrandButton>
                    </div>

                    {mode === 'signup' && role === 'tutor' && (
                      <p className="text-xs text-muted-foreground">After verifying your email, complete your profile in the tutor dashboard.</p>
                    )}
                  </motion.form>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
