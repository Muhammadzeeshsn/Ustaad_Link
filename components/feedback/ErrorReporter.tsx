// components/feedback/ErrorReporter.tsx
"use client"

import { useState } from "react"
import { BrandButton } from "@/components/brand/BrandButton"

type Props = {
  defaultMessage?: string
  path?: string
  onSent?: () => void
}

export default function ErrorReporter({ defaultMessage = "", path, onSent }: Props) {
  const [text, setText] = useState(defaultMessage)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const page = path || (typeof window !== "undefined" ? window.location.pathname : "")

  async function submit() {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          page,
        }),
      })
      if (!res.ok) throw new Error("send_failed")
      setSent(true)
      onSent?.()
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return <div className="text-sm text-emerald-600">Thanks — your report was sent to the admin.</div>
  }

  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full rounded-md border p-2 text-sm"
        placeholder="Describe what you were doing when this happened…"
      />
      <div className="flex gap-2">
        <BrandButton type="button" onClick={submit} disabled={sending || !text.trim()}>
          {sending ? "Sending…" : "Send to Admin"}
        </BrandButton>
        <div className="text-xs text-slate-500">We’ll include page, your user ID (if logged in), and IP automatically.</div>
      </div>
    </div>
  )
}
