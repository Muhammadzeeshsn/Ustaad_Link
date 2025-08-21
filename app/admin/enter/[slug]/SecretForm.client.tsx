'use client'

import * as React from 'react'
import { useFormStatus } from 'react-dom'

export default function SecretForm({
  action,
}: {
  action: (formData: FormData) => void
}) {
  return (
    <form action={action} className="space-y-4 relative">
      <label className="block text-sm font-medium">
        Secret key
        <input
          name="code"
          type="password"
          autoComplete="off"
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter admin secret"
          required
        />
      </label>

      <SubmitButton>Continue</SubmitButton>
      <PendingOverlay label="Sending code…" />
    </form>
  )
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
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
