// components/feedback/ErrorReporter.tsx
"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function ErrorReporter({ defaultMessage = "", path = "" }: { defaultMessage?: string; path?: string }) {
  const [note, setNote] = useState("")

  async function submit() {
    try {
      await fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: defaultMessage,
          path,
          meta: { userNote: note || null, userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "" },
        }),
      })
      alert("Thanks! Your report has been sent to admin.")
    } catch {
      alert("Failed to send report.")
    }
  }

  return (
    <div className="grid gap-2 py-2">
      <Label htmlFor="report-note">Add details (optional)</Label>
      <Textarea id="report-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What were you doing when it happened?" />
      <div className="mt-1 flex justify-end">
        <Button onClick={submit}>Report to Admin</Button>
      </div>
    </div>
  )
}
