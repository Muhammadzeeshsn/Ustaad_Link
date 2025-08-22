// app/auth/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { BrandButton } from '@/components/brand/BrandButton'
import { useToast } from '@/components/ui/use-toast'
import { Mail, Lock, User, Phone, CheckCircle2 } from 'lucide-react'
import { fadeUp, slideCard } from '@/lib/motion'

type RoleTab = 'student' | 'tutor'
type RoleUpper = 'STUDENT' | 'TUTOR'
type Mode = 'login' | 'signup'

const BRAND = '#0B1533'
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const toUpperRole = (r: RoleTab): RoleUpper => (r === 'student' ? 'STUDENT' : 'TUTOR')
const normalizeEmail = (e: string) => e.trim().toLowerCase()

const SixBoxOtp = ({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) => {
  const digits = value.padEnd(6, ' ').slice(0, 6).split('')

  // helper to focus input by index
  const focus = (idx: number) => {
    const el = document.getElementById(`otp-${idx}`) as HTMLInputElement | null
    el?.focus()
    el?.select?.()
  }

  return (
    <div className="mt-2 grid grid-cols-6 gap-2">
      {digits.map((ch, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={ch === ' ' ? '' : ch}
          onPaste={(e) => {
            const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)
            if (!pasted) return
            e.preventDefault()
            onChange(pasted)
            // focus next empty or last
            const nextIdx = Math.min(pasted.length, 5)
            focus(nextIdx)
          }}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, '')
            const arr = value.padEnd(6, ' ').slice(0, 6).split('')
            arr[i] = d ? d.slice(-1) : ' '
            const joined = arr.join('').replace(/\s/g, '')
            onChange(joined.slice(0, 6))
            if (d) focus(i + 1)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              if (value[i]) {
                // delete current
                const arr = value.padEnd(6, ' ').slice(0, 6).split('')
                arr[i] = ' '
                onChange(arr.join('').replace(/\s/g, ''))
              } else if (i > 0) {
                focus(i - 1)
              }
            }
            if (e.key === 'ArrowLeft' && i > 0) focus(i - 1)
            if (e.key === 'ArrowRight' && i < 5) focus(i + 1)
          }}
          disabled={disabled}
          className="h-11 w-full rounded-md border px-0 text-center text-lg tracking-widest outline-none focus:ring-2 focus:ring-[color:var(--brand,#0B1533)]"
        />
      ))}
    </div>
  )
}

export default function AuthPage() {
  const [role, setRole] = useState<RoleTab>('student')
  const [mode, setMode] = useState<Mode>('signup')
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [inlineSuccess, setInlineSuccess] = useState<string | null>(null)
  const [inlineNote, setInlineNote] = useState<string | null>(null)

  // signup verify
  const [signupChallengeId, setSignupChallengeId] = useState<string | null>(null)
  const [signupOtp, setSignupOtp] = useState('')
  const [verifyingSignup, setVerifyingSignup] = useState(false)
  const [signupStep, setSignupStep] = useState<'form' | 'otp' | 'verified'>('form')

  // forgot
  const [forgotOpen, setForgotOpen] = useState(false)
  type ForgotStage = 'email' | 'otp' | 'reset' | 'done'
  const [forgotStage, setForgotStage] = useState<ForgotStage>('email')
  const [resetEmail, setResetEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState<number>(0)
  const [timerTick, setTimerTick] = useState(0)
  const [sendingReset, setSendingReset] = useState(false)

  // new pass
  const [newPass, setNewPass] = useState('')
  const [newPass2, setNewPass2] = useState('')

  // login OTP gate
  const [loginOtpNeeded, setLoginOtpNeeded] = useState(false)
  const [loginOtp, setLoginOtp] = useState('')
  const [loginChallengeId, setLoginChallengeId] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    if (!emailOk(email) || password.length < 6) return false
    if (mode === 'signup' && name.trim().length < 2) return false
    return true
  }, [email, password, mode, name])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setTimerTick((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])
  const remaining = Math.max(0, cooldown - timerTick)

  function resetMessages() {
    setInlineError(null)
    setInlineSuccess(null)
    setInlineNote(null)
  }

  async function startOtp(params: any) {
    const res = await fetch('/api/auth/otp/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const j = await res.json().catch(() => ({}))
    return { status: res.status, data: j }
  }

  async function verifyOtp(params: any) {
    const res = await fetch('/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      if (j?.error === 'bad_code' || j?.error === 'invalid_code') throw new Error('Incorrect code. Please try again.')
      if (j?.error === 'expired') throw new Error('Code expired. Request a new one.')
      throw new Error('Verification failed.')
    }
    return j
  }

  // ------ SIGNUP: verify first, create on verify (server handles actual create on verify) ------
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    resetMessages()
    setSubmitting(true)
    try {
      const normalizedEmail = normalizeEmail(email)
      const roleUpper = toUpperRole(role)

      const { status, data } = await startOtp({
        email: normalizedEmail,
        reason: 'register',
        role: roleUpper,
        payload: { name, phone, password, role: roleUpper },
      })
      if (status === 409) {
        setInlineError('An account with this email already exists.')
        return
      }
      if (status === 429) {
        const remain = data?.remain ?? 45
        setCooldown(remain)
        setTimerTick(0)
        setInlineNote(`Please wait ${remain}s before requesting another code.`)
        return
      }
      if (status !== 200) {
        setInlineError('Could not send verification code.')
        return
      }
      setSignupChallengeId(data.challengeId)
      setSignupStep('otp')
      setCooldown(data.cooldown ?? 45)
      setTimerTick(0)
      setInlineSuccess('We sent a 6-digit code to your email.')
    } catch (err: any) {
      setInlineError(err?.message ?? 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmSignupOtp() {
    if ((signupOtp || '').replace(/\D/g, '').length !== 6 || !signupChallengeId) return
    setVerifyingSignup(true)
    resetMessages()
    try {
      await verifyOtp({
        email: normalizeEmail(email),
        reason: 'register',
        code: signupOtp,
        challengeId: signupChallengeId,
      })
      setSignupStep('verified')
      setInlineSuccess('Email verified! You can log in now.')
      setTimeout(() => setMode('login'), 800)
    } catch (e: any) {
      setInlineError(e?.message || 'Verification failed.')
    } finally {
      setVerifyingSignup(false)
    }
  }

  // ------ LOGIN (with precheck that enforces OTP after 3 wrong attempts, on NEXT correct password) ------
  async function precheckLogin(): Promise<'ok' | 'wrong' | 'otp' | 'legacy'> {
    try {
      const roleUpper = toUpperRole(role)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizeEmail(email),
          password,
          role: roleUpper,
        }),
      })
      if (res.ok) {
        const j = await res.json().catch(() => ({}))
        if (j?.ok) return 'ok'
        if (j?.otp_required) return 'otp'
        return 'wrong'
      }
      // if endpoint not present/returns 404 etc., fall back to legacy behavior
      return 'legacy'
    } catch {
      return 'legacy'
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    resetMessages()
    setSubmitting(true)
    try {
      const roleUpper = toUpperRole(role)
      const normalizedEmail = normalizeEmail(email)

      const check = await precheckLogin()
      if (check === 'ok' || check === 'legacy') {
        const res = await signIn('credentials', {
          email: normalizedEmail,
          password,
          role: roleUpper,
          redirect: false,
          callbackUrl: roleUpper === 'STUDENT' ? '/dashboard/student' : '/dashboard/tutor',
        })
        if (res?.ok) {
          return router.push(res.url ?? (roleUpper === 'STUDENT' ? '/dashboard/student' : '/dashboard/tutor'))
        }

        // legacy path: some backends signal OTP via error text
        const err = res?.error ?? ''
        if (err.includes('OTP_REQUIRED')) {
          setLoginOtpNeeded(true)
          const started = await startOtp({ email: normalizedEmail, reason: 'login', role: roleUpper })
          if (started.status === 200) {
            setLoginChallengeId(started.data?.challengeId ?? null)
            setCooldown(started.data?.cooldown ?? 45)
            setTimerTick(0)
            setInlineNote('We sent a 6-digit login code to your email.')
          } else if (started.status === 429) {
            setCooldown(started.data?.remain ?? 45)
            setTimerTick(0)
            setInlineNote(`Please wait ${started.data?.remain ?? 45}s before requesting another code.`)
          }
          return
        }

        setInlineError(err || 'Unable to sign in')
        return
      }

      if (check === 'otp') {
        // correct password BUT gate active => require OTP now
        setLoginOtpNeeded(true)
        const started = await startOtp({ email: normalizedEmail, reason: 'login', role: roleUpper })
        if (started.status === 200) {
          setLoginChallengeId(started.data?.challengeId ?? null)
          setCooldown(started.data?.cooldown ?? 45)
          setTimerTick(0)
          setInlineNote('We sent a 6-digit login code to your email.')
        } else if (started.status === 429) {
          setCooldown(started.data?.remain ?? 45)
          setTimerTick(0)
          setInlineNote(`Please wait ${started.data?.remain ?? 45}s before requesting another code.`)
        }
        return
      }

      // wrong password case from precheck
      setInlineError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  async function verifyLoginOtpAndRetry() {
    resetMessages()
    try {
      if ((loginOtp || '').replace(/\D/g, '').length !== 6) {
        setInlineError('Enter the 6-digit code.')
        return
      }
      if (!loginChallengeId) {
        setInlineError('Please press “Resend code” to get a new code.')
        return
      }
      const norm = normalizeEmail(email)
      await verifyOtp({ email: norm, reason: 'login', code: loginOtp, challengeId: loginChallengeId })

      // now attempt the actual sign in
      const roleUpper = toUpperRole(role)
      const res = await signIn('credentials', {
        email: norm,
        password,
        role: roleUpper,
        redirect: false,
        callbackUrl: roleUpper === 'STUDENT' ? '/dashboard/student' : '/dashboard/tutor',
      })
      if (res?.ok) {
        return router.push(res.url ?? (roleUpper === 'STUDENT' ? '/dashboard/student' : '/dashboard/tutor'))
      }
      setInlineError(res?.error || 'Could not complete login.')
    } catch (e: any) {
      setInlineError(e?.message || 'Verification failed.')
    }
  }

  // ------ FORGOT (inline as in your original file) ------
  function openForgot() {
    resetMessages()
    setForgotOpen(true)
    setForgotStage('email')
    setResetEmail('')
    setOtp('')
    setNewPass('')
    setNewPass2('')
    setCooldown(0)
    setTimerTick(0)
    setChallengeId(null)
  }

  async function sendResetOtp(e?: React.FormEvent) {
    e?.preventDefault()
    if (sendingReset || remaining > 0) return
    resetMessages()
    setSendingReset(true)
    try {
      const normalized = normalizeEmail(resetEmail)
      if (!emailOk(normalized)) throw new Error('Enter a valid email.')
      const roleUpper = toUpperRole(role)
      const { status, data } = await startOtp({ email: normalized, reason: 'reset', role: roleUpper })
      if (status === 404) {
        setInlineError('No account found with this email in the selected role.')
        return
      }
      if (status === 429) {
        // stay on email screen; show cooldown
        setCooldown(data?.remain ?? 45)
        setTimerTick(0)
        setInlineNote(`Please wait ${data?.remain ?? 45}s before requesting another code.`)
        return
      }
      if (status !== 200) {
        setInlineError('Could not send code. Try again.')
        return
      }
      setChallengeId(data.challengeId)
      setForgotStage('otp')
      setCooldown(data.cooldown ?? 45)
      setTimerTick(0)
      setInlineSuccess('OTP sent successfully.')
    } catch (err: any) {
      setInlineError(err?.message ?? 'Could not send code.')
    } finally {
      setSendingReset(false)
    }
  }

  async function verifyResetOtp(e?: React.FormEvent) {
    e?.preventDefault()
    resetMessages()
    try {
      if ((otp || '').replace(/\D/g, '').length !== 6) throw new Error('Enter the 6-digit code.')
      if (!challengeId) throw new Error('No active code. Please resend.')
      await verifyOtp({
        email: normalizeEmail(resetEmail),
        reason: 'reset',
        code: otp,
        challengeId,
      })
      setForgotStage('reset')
      setInlineSuccess('Verified! Please set a new password.')
    } catch (err: any) {
      setInlineError(err?.message ?? 'Verification failed.')
    }
  }

  async function submitNewPassword(e?: React.FormEvent) {
    e?.preventDefault()
    resetMessages()
    try {
      if (newPass.length < 6) throw new Error('Password must be at least 6 characters.')
      if (newPass !== newPass2) throw new Error('Passwords do not match.')
      if (!challengeId) throw new Error('Missing verification. Please verify OTP again.')

      // NOTE: Keeping your existing endpoint & payload shape to avoid breaking your backend.
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizeEmail(resetEmail), newPassword: newPass, challengeId }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error || 'Could not update password.')

      setForgotStage('done')
      setInlineSuccess('Password updated. You can log in now.')
      setTimeout(() => {
        setForgotOpen(false)
        setMode('login')
        setEmail(resetEmail)
      }, 800)
    } catch (err: any) {
      setInlineError(err?.message ?? 'Failed to update password.')
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col bg-white text-[color:var(--brand,#0B1533)]"
      style={{ ['--brand' as any]: BRAND }}
    >
      <div className="relative">
        <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-[color:var(--brand,#0B1533)]/30 to-transparent" />
      </div>

      <section className="container mx-auto px-4 py-10 md:py-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto grid max-w-5xl gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2"
        >
          {/* Left brand panel */}
          <aside className="hidden md:block" style={{ backgroundColor: BRAND }}>
            <div className="relative h-full p-8 text-white">
              <div className="pointer-events-none absolute -top-10 -inset-x-10 h-20 rotate-6 bg-white/10 blur-xl" />
              <div className="mx-auto max-w-sm">
                <h1 className="text-3xl font-extrabold">Welcome to UstaadLink</h1>
                <p className="mt-3 text-white/90">One simple account—for Students & Tutors. Admin-reviewed for quality.</p>
                <ul className="mt-6 space-y-2 text-sm text-white/95">
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4" /> Admin-approved matching</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4" /> Track request status end-to-end</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4" /> Email verification built-in</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Right form panel */}
          <div className="bg-white p-6 md:p-8">
            <Tabs value={role} onValueChange={(v) => setRole(v as RoleTab)} className="w-full">
              <TabsList className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <TabsTrigger value="student" className="data-[state=active]:bg-[color:var(--brand,#0B1533)] data-[state=active]:text-white">
                  Student
                </TabsTrigger>
                <TabsTrigger value="tutor" className="data-[state=active]:bg-[color:var(--brand,#0B1533)] data-[state=active]:text-white">
                  Tutor
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {inlineError && (
                  <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{inlineError}</div>
                )}
                {inlineSuccess && (
                  <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{inlineSuccess}</div>
                )}
                {inlineNote && (
                  <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{inlineNote}</div>
                )}

                {/* LOGIN OTP panel */}
                {loginOtpNeeded ? (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold">Enter login verification code</div>
                    <div className="text-sm text-slate-600">We sent a code to <b>{email}</b>. It expires in 2 minutes.</div>
                    <SixBoxOtp value={loginOtp} onChange={setLoginOtp} />
                    <div className="flex items-center gap-2 pt-2">
                      <BrandButton type="button" onClick={verifyLoginOtpAndRetry} disabled={loginOtp.replace(/\D/g, '').length !== 6}>
                        Verify & continue
                      </BrandButton>
                      <button
                        type="button"
                        className="text-sm text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline disabled:opacity-50"
                        disabled={remaining > 0}
                        onClick={async () => {
                          resetMessages()
                          const { status, data } = await startOtp({ email: normalizeEmail(email), reason: 'login', role: toUpperRole(role) })
                          if (status === 429) {
                            const remain = data?.remain ?? 45
                            setCooldown(remain)
                            setTimerTick(0)
                            setInlineNote(`Please wait ${remain}s before requesting another code.`)
                          } else if (status === 200) {
                            setLoginChallengeId(data.challengeId ?? null)
                            setCooldown(data.cooldown ?? 45)
                            setTimerTick(0)
                            setInlineSuccess('OTP sent successfully.')
                          } else {
                            setInlineError('Could not resend code.')
                          }
                        }}
                      >
                        {remaining > 0 ? `Resend in ${remaining}s` : 'Resend code'}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-slate-600 underline-offset-2 hover:underline"
                      onClick={() => setLoginOtpNeeded(false)}
                    >
                      Back to login
                    </button>
                  </div>
                ) : null}

                {/* Main forms (hidden while login OTP panel is shown) */}
                {!loginOtpNeeded && (
                  <AnimatePresence mode="wait">
                    <motion.form
                      key={`${role}-${mode}-${signupStep}`}
                      variants={slideCard}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      onSubmit={mode === 'signup' ? handleSignup : handleLogin}
                      className="space-y-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                          {mode === 'signup'
                            ? signupStep === 'form'
                              ? 'Create account'
                              : 'Verify your email'
                            : 'Log in'}
                        </h2>
                        {mode === 'signup' && signupStep === 'form' ? (
                          <button
                            type="button"
                            className="text-sm font-medium text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline"
                            onClick={() => { resetMessages(); setMode('login') }}
                          >
                            Have an account? Log in
                          </button>
                        ) : mode === 'login' ? (
                          <button
                            type="button"
                            className="text-sm font-medium text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline"
                            onClick={() => { resetMessages(); setMode('signup') }}
                          >
                            New here? Sign up
                          </button>
                        ) : null}
                      </div>

                      {mode === 'signup' && signupStep === 'form' && (
                        <>
                          <label className="block text-sm font-medium">
                            Full name
                            <div className="relative mt-1">
                              <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} disabled={submitting} />
                              <User className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                            </div>
                          </label>

                          <label className="block text-sm font-medium">
                            Phone (optional)
                            <div className="relative mt-1">
                              <Input placeholder="+92 3xx xxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={submitting} />
                              <Phone className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                            </div>
                          </label>

                          <label className="block text-sm font-medium">
                            Email
                            <div className="relative mt-1">
                              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} required />
                              <Mail className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                            </div>
                          </label>

                          <label className="block text-sm font-medium">
                            Password
                            <div className="relative mt-1">
                              <Input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} disabled={submitting} required />
                              <Lock className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                            </div>
                          </label>

                          <div className="pt-2">
                            <BrandButton type="submit" disabled={!emailOk(email) || password.length < 6 || name.trim().length < 2 || submitting} className="w-full">
                              {submitting ? 'Please wait...' : `Create ${role} account`}
                            </BrandButton>
                          </div>
                        </>
                      )}

                      {mode === 'signup' && signupStep === 'otp' && (
                        <>
                          <div className="text-sm text-slate-600">Enter the 6-digit code we sent to <b>{email}</b>.</div>
                          <SixBoxOtp value={signupOtp} onChange={setSignupOtp} disabled={verifyingSignup} />
                          <div className="flex items-center justify-between pt-2">
                            <BrandButton type="button" disabled={signupOtp.replace(/\D/g, '').length !== 6 || verifyingSignup || !signupChallengeId} onClick={confirmSignupOtp}>
                              {verifyingSignup ? 'Verifying…' : 'Verify'}
                            </BrandButton>
                            <button
                              type="button"
                              disabled={remaining > 0}
                              onClick={async () => {
                                resetMessages()
                                const { status, data } = await startOtp({
                                  email: normalizeEmail(email),
                                  reason: 'register',
                                  role: toUpperRole(role),
                                  payload: { name, phone, password, role: toUpperRole(role) },
                                })
                                if (status === 429) {
                                  const remain = data?.remain ?? 45
                                  setCooldown(remain)
                                  setTimerTick(0)
                                  setInlineNote(`Please wait ${remain}s before requesting another code.`)
                                  return
                                }
                                if (status !== 200) {
                                  setInlineError('Could not resend code.')
                                  return
                                }
                                setSignupChallengeId(data.challengeId)
                                setCooldown(data.cooldown ?? 45)
                                setTimerTick(0)
                                setInlineSuccess('OTP sent successfully.')
                              }}
                              className={`text-sm underline-offset-2 ${remaining > 0 ? 'text-slate-400' : 'text-[color:var(--brand,#0B1533)] hover:underline'}`}
                            >
                              {remaining > 0 ? `Resend in ${remaining}s` : 'Resend code'}
                            </button>
                          </div>
                        </>
                      )}

                      {mode === 'login' && (
                        <>
                          <label className="block text-sm font-medium">
                            Email
                            <div className="relative mt-1">
                              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} required />
                              <Mail className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                            </div>
                          </label>

                          <label className="block text-sm font-medium">
                            Password
                            <div className="relative mt-1">
                              <Input type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={submitting} required />
                              <Lock className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                            </div>
                          </label>

                          <div className="flex items-center justify-between pt-2">
                            <BrandButton type="submit" disabled={submitting} className="w-40">
                              {submitting ? 'Please wait...' : 'Log in'}
                            </BrandButton>
                            <button type="button" onClick={openForgot} className="text-sm text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline">
                              Forgot password?
                            </button>
                          </div>
                        </>
                      )}
                    </motion.form>
                  </AnimatePresence>
                )}

                {/* Forgot flow */}
                {forgotOpen && !loginOtpNeeded && (
                  <AnimatePresence mode="wait">
                    <motion.div key={`forgot-${forgotStage}`} variants={slideCard} initial="hidden" animate="visible" exit="exit">
                      {forgotStage === 'email' && (
                        <form onSubmit={sendResetOtp} className="space-y-4">
                          <div className="text-lg font-semibold">Reset password</div>
                          <label className="block text-sm font-medium">
                            Registered email (as a {role})
                            <div className="relative mt-1">
                              <Input type="email" placeholder="you@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                              <Mail className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                            </div>
                          </label>
                          <div className="flex items-center gap-2 pt-2">
                            <BrandButton type="submit" disabled={sendingReset || remaining > 0}>{sendingReset ? 'Sending…' : 'Send code'}</BrandButton>
                            <button type="button" className="text-sm text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline" onClick={() => { setForgotOpen(false); resetMessages() }}>
                              Back
                            </button>
                          </div>
                        </form>
                      )}

                      {forgotStage === 'otp' && (
                        <form onSubmit={verifyResetOtp} className="space-y-4">
                          <div className="text-lg font-semibold">Enter the 6-digit code</div>
                          <div className="text-sm text-slate-600">We sent a code to <b>{resetEmail}</b>. It expires in 2 minutes.</div>
                          <SixBoxOtp value={otp} onChange={setOtp} />
                          <div className="flex items-center justify-between pt-2">
                            <BrandButton type="submit" disabled={otp.replace(/\D/g, '').length !== 6}>Verify</BrandButton>
                            <button
                              type="button"
                              disabled={remaining > 0}
                              onClick={sendResetOtp}
                              className={`text-sm underline-offset-2 ${remaining > 0 ? 'text-slate-400' : 'text-[color:var(--brand,#0B1533)] hover:underline'}`}
                            >
                              {remaining > 0 ? `Resend in ${remaining}s` : 'Resend code'}
                            </button>
                          </div>
                        </form>
                      )}

                      {forgotStage === 'reset' && (
                        <form onSubmit={submitNewPassword} className="space-y-4">
                          <div className="text-lg font-semibold">Set a new password</div>
                          <label className="block text-sm font-medium">
                            New password
                            <div className="relative mt-1">
                              <Input type="password" placeholder="At least 6 characters" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                              <Lock className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                            </div>
                          </label>
                          <label className="block text-sm font-medium">
                            Confirm password
                            <div className="relative mt-1">
                              <Input type="password" placeholder="Repeat password" value={newPass2} onChange={(e) => setNewPass2(e.target.value)} />
                              <Lock className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                            </div>
                          </label>
                          <div className="flex items-center gap-2 pt-2">
                            <BrandButton type="submit">Update password</BrandButton>
                          </div>
                        </form>
                      )}

                      {forgotStage === 'done' && (
                        <div className="space-y-2">
                          <div className="text-lg font-semibold text-emerald-700">Password updated</div>
                          <div className="text-sm text-slate-600">You can log in with your new password now.</div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </Tabs>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
