'use client'

import * as React from 'react'
import { useFormStatus } from 'react-dom'

export default function OtpForm({
  action,
  onResend,
}: {
  action: (formData: FormData) => Promise<void> | void
  onResend: () => Promise<void> | void
}) {
  const [digits, setDigits] = React.useState<string[]>(['', '', '', '', '', ''])
  const [showSuccessFlash, setShowSuccessFlash] = React.useState(false)

  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([])
  const formRef = React.useRef<HTMLFormElement | null>(null)
  const submitBtnRef = React.useRef<HTMLButtonElement | null>(null)

  const value = digits.join('')
  const len = value.length

  // When 6 digits filled, show flash briefly then submit via real submitter.
  React.useEffect(() => {
    if (len === 6 && !showSuccessFlash) {
      setShowSuccessFlash(true)
      const t = setTimeout(() => {
        // Click the actual submit button (more reliable than requestSubmit across browsers)
        submitBtnRef.current?.click()
      }, 350)
      return () => clearTimeout(t)
    }
  }, [len, showSuccessFlash])

  function setAt(i: number, v: string) {
    setDigits(prev => {
      const next = [...prev]
      next[i] = v
      return next
    })
  }

  function onChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const only = raw.replace(/\D+/g, '')
    if (!only) {
      setAt(i, '')
      return
    }
    const [first, ...rest] = only.split('')
    setAt(i, first)
    if (i < 5) {
      inputsRef.current[i + 1]?.focus()
      if (rest.length) {
        for (let k = 0; k < rest.length && i + 1 + k < 6; k++) {
          setAt(i + 1 + k, rest[k])
        }
      }
    }
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus()
      setAt(i - 1, '')
    }
    if (e.key === 'ArrowLeft' && i > 0) inputsRef.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) inputsRef.current[i + 1]?.focus()
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text') || ''
    const only = text.replace(/\D+/g, '').slice(0, 6).split('')
    if (only.length) {
      e.preventDefault()
      setDigits(prev => {
        const next = [...prev]
        for (let i = 0; i < 6; i++) next[i] = only[i] ?? ''
        return next
      })
      inputsRef.current[Math.min(5, only.length)]?.focus()
    }
  }

  return (
    <form ref={formRef} action={action} className="relative space-y-4">
      {/* Hidden combined value */}
      <input type="hidden" name="otp" value={value} />

      {/* 6 digit boxes */}
      <div className="flex items-center justify-between gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el }}  // return void (no TS error)
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete="one-time-code"
            className="h-12 w-12 text-center text-lg font-semibold rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary"
            value={digits[i]}
            onChange={(e) => onChange(i, e)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      {/* Main submit (verify). Enabled only when 6 digits present. */}
      <SubmitButton innerRef={submitBtnRef} disabled={len !== 6}>
        Verify OTP
      </SubmitButton>

      {/* Resend button uses same form, different server action (no nested form). */}
      <div className="text-xs text-muted-foreground">
        Didn’t get it?
        <button
          type="submit"
          formAction={onResend}
          className="ml-1 underline underline-offset-2 hover:no-underline"
        >
          Resend code
        </button>
      </div>

      {/* Pending overlay switches label once we show the success flash */}
      <PendingOverlay label={showSuccessFlash ? 'Verified! Redirecting…' : 'Verifying…'} />

      {/* Quick success flash while we programmatically submit */}
      {showSuccessFlash && (
        <div className="absolute inset-0 grid place-items-center rounded-md bg-background/70">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white">✔</span>
            Verified! Press Lenter to continue.
          </div>
        </div>
      )}
    </form>
  )
}

function SubmitButton({
  children,
  disabled,
  innerRef,
}: {
  children: React.ReactNode
  disabled?: boolean
  innerRef?: React.Ref<HTMLButtonElement>
}) {
  const { pending } = useFormStatus()
  const isDisabled = disabled || pending
  return (
    <button
      ref={innerRef}
      type="submit"
      disabled={isDisabled}
      className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
    >
      {pending ? 'Please wait…' : children}
    </button>
  )
}

function PendingOverlay({ label }: { label: string }) {
  const { pending } = useFormStatus()
  if (!pending) return null
  return (
    <div className="absolute inset-0 grid place-items-center rounded-md bg-background/70">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {label}
      </div>
    </div>
  )
}
