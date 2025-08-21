// app/admin/enter/[slug]/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import crypto from 'crypto'
import { sendMail } from '@/app/lib/mail'

import SecretForm from './SecretForm.client'
import OtpForm from './OtpForm.client'


type Props = {
  params: { slug: string }
  searchParams?: { step?: string; error?: string; prompt?: string; ecode?: string }
}

/* ---------- tiny signed-token helpers for OTP cookie ---------- */
function hmac(data: string, key: string) {
  return crypto.createHmac('sha256', key).update(data).digest('hex')
}
function sha256(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex')
}
function b64url(s: string) {
  return Buffer.from(s).toString('base64url')
}
function fromB64url(s: string) {
  return Buffer.from(s, 'base64url').toString('utf8')
}
function makeToken(payload: object, secret: string) {
  const body = JSON.stringify(payload)
  const sig = hmac(body, secret)
  return b64url(`${sig}.${body}`)
}
function parseToken(token: string, secret: string): any | null {
  try {
    const raw = fromB64url(token)
    const [sig, body] = raw.split('.', 2)
    if (!sig || !body) return null
    const good = hmac(body, secret)
    if (sig !== good) return null
    return JSON.parse(body)
  } catch {
    return null
  }
}

export default function AdminEntryPage({ params, searchParams }: Props) {
  const expectedSlug = process.env.ADMIN_ENTRY_SLUG ?? 'sltech'
  const expectedCode = process.env.ADMIN_ENTRY_CODE ?? 'letmein'
  const adminEmail = process.env.ADMIN_EMAIL
  const otpSecret =
    process.env.ADMIN_OTP_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'fallback'
  const gateTtlSeconds = Number(process.env.ADMIN_GATE_TTL_SECONDS ?? '300') // 5 min

  const c = cookies()
  const gate = c.get('admin-gate')?.value
  const otpCookie = c.get('admin-otp')?.value

  // Already passed? Only auto-redirect if no explicit ?prompt=1
  if (gate === expectedSlug && !searchParams?.prompt) {
    redirect('/admin')
  }

  // Validate OTP cookie; clear if invalid/expired so we fall back to secret
  let otpIsValid = false
  if (otpCookie) {
    const parsed = parseToken(otpCookie, otpSecret)
    if (
      parsed &&
      parsed.slug === expectedSlug &&
      typeof parsed.exp === 'number' &&
      Date.now() < parsed.exp &&
      typeof parsed.hash === 'string' &&
      typeof parsed.salt === 'string'
    ) {
      otpIsValid = true
    } else {
      c.set('admin-otp', '', { path: '/', maxAge: 0 })
    }
  }

  const step =
    (searchParams?.step === 'otp' || otpIsValid) && !searchParams?.prompt
      ? 'otp'
      : 'secret'
  const err = searchParams?.error
  const ecode = searchParams?.ecode

  /* ---------- server action: start (secret -> send OTP) ---------- */
  async function start(formData: FormData) {
    'use server'
    const code = (formData.get('code') || '').toString().trim()

    if (params.slug !== expectedSlug) {
      redirect('/auth?admin=1')
    }
    if (code !== expectedCode) {
      redirect(`/admin/enter/${params.slug}?error=secret`)
    }
    if (!adminEmail) {
      redirect(`/admin/enter/${params.slug}?error=mail`)
    }

    const otp = (Math.floor(100000 + Math.random() * 900000)).toString()
    const salt = crypto.randomBytes(8).toString('hex')
    const hash = sha256(`${otp}:${salt}`)
    const exp = Date.now() + 5 * 60 * 1000 // 5 minutes

    const token = makeToken({ slug: expectedSlug, hash, salt, exp }, otpSecret)
    cookies().set('admin-otp', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 5 * 60,
    })

    try {
      await sendMail({
        to: adminEmail!,
        subject: 'Your UstaadLink admin OTP',
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
            <p>Use the following code to continue admin sign-in:</p>
            <p style="font-size:24px;font-weight:700;letter-spacing:2px">${otp}</p>
            <p>This code expires in 5 minutes.</p>
          </div>
        `,
        text: `Your admin OTP is ${otp} (valid for 5 minutes).`,
      })
    } catch (e: any) {
      cookies().set('admin-otp', '', { path: '/', maxAge: 0 })
      const code = e?.code || e?.responseCode || e?.name || 'MAIL'
      redirect(`/admin/enter/${params.slug}?error=mail&ecode=${encodeURIComponent(String(code))}`)
    }

    redirect(`/admin/enter/${params.slug}?step=otp`)
  }

  /* ---------- server action: verify OTP ---------- */
  async function verify(formData: FormData) {
    'use server'
    const code = (formData.get('otp') || '').toString().trim()
    const token = cookies().get('admin-otp')?.value
    if (!token) {
      redirect(`/admin/enter/${params.slug}?error=expired`)
    }
    const parsed = parseToken(token, otpSecret)
    if (!parsed || parsed.slug !== expectedSlug) {
      cookies().set('admin-otp', '', { path: '/', maxAge: 0 })
      redirect(`/admin/enter/${params.slug}?error=expired`)
    }
    const { hash, salt, exp } = parsed as { hash: string; salt: string; exp: number }
    if (Date.now() > exp) {
      cookies().set('admin-otp', '', { path: '/', maxAge: 0 })
      redirect(`/admin/enter/${params.slug}?error=expired`)
    }
    const tryHash = sha256(`${code}:${salt}`)
    if (tryHash !== hash) {
      redirect(`/admin/enter/${params.slug}?step=otp&error=otp`)
    }

    // success: short-lived gate & clear otp
    cookies().set('admin-gate', expectedSlug, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: gateTtlSeconds,
    })
    cookies().set('admin-otp', '', { path: '/', maxAge: 0 })

    redirect('/admin')
  }

  /* ---------- server action: resend OTP ---------- */
  async function resend() {
    'use server'
    const token = cookies().get('admin-otp')?.value
    if (!token) {
      redirect(`/admin/enter/${params.slug}`)
    }
    const parsed = parseToken(token, otpSecret)
    if (!parsed || parsed.slug !== expectedSlug || Date.now() > parsed.exp) {
      cookies().set('admin-otp', '', { path: '/', maxAge: 0 })
      redirect(`/admin/enter/${params.slug}?error=expired`)
    }

    const otp = (Math.floor(100000 + Math.random() * 900000)).toString()
    const salt = crypto.randomBytes(8).toString('hex')
    const hash = sha256(`${otp}:${salt}`)
    const exp = Date.now() + 5 * 60 * 1000

    const newToken = makeToken({ slug: expectedSlug, hash, salt, exp }, otpSecret)
    cookies().set('admin-otp', newToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 5 * 60,
    })

    try {
      await sendMail({
        to: adminEmail!,
        subject: 'Your UstaadLink admin OTP (resend)',
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
            <p>Use the following code to continue admin sign-in:</p>
            <p style="font-size:24px;font-weight:700;letter-spacing:2px">${otp}</p>
            <p>This code expires in 5 minutes.</p>
          </div>
        `,
        text: `Your admin OTP is ${otp} (valid for 5 minutes).`,
      })
    } catch (e) {
      cookies().set('admin-otp', '', { path: '/', maxAge: 0 })
      redirect(`/admin/enter/${params.slug}?error=mail`)
    }

    redirect(`/admin/enter/${params.slug}?step=otp`)
  }

  return (
    <main className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card shadow-sm p-6">
        <h1 className="text-xl font-semibold">Admin Access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 'secret'
            ? 'Enter the secret key to start verification.'
            : 'We emailed a 6-digit code. Enter it below to continue.'}
        </p>

        {/* Errors */}
        {err === 'secret' && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Invalid secret. Please try again.
          </div>
        )}
        {err === 'otp' && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Incorrect OTP. Please try again.
          </div>
        )}
        {err === 'expired' && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            OTP expired. Please restart verification.
          </div>
        )}
        {err === 'mail' && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Could not send email. {ecode ? `(${ecode}) ` : ''}Check SMTP settings and try again.
          </div>
        )}

        {/* Forms */}
        {step === 'secret' ? (
          <div className="mt-6">
            <SecretForm action={start} />
          </div>
        ) : (
          <div className="mt-6">
            <OtpForm action={verify} onResend={resend} />
          </div>
        )}

        <div className="mt-6 text-xs text-muted-foreground">
          Route: <code>/admin/enter/{params.slug}</code>
        </div>
      </div>
    </main>
  )
}
