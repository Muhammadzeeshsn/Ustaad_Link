"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

type Props = {
  /** Kept for backwards compatibility, but NOT shown in the textarea */
  defaultMessage?: string
  /** New: attach technical detail silently */
  hiddenDetail?: string
  triggerText?: string
  triggerClassName?: string
}

export default function ErrorReporter({
  defaultMessage = "",
  hiddenDetail,
  triggerText = "Report to Technical Team",
  triggerClassName,
}: Props) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [message, setMessage] = React.useState("")

  React.useEffect(() => {
    if (open) setMessage("") // keep field empty for the user
  }, [open])

  async function submit() {
    if (!message.trim()) {
      toast({ title: "Please describe the issue", variant: "destructive" })
      return
    }
    try {
      const res = await fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,                                      // user's message (visible)
          pageUrl: typeof window !== "undefined" ? window.location.href : null,
          // Attach technical details silently. Prefer hiddenDetail, fallback to defaultMessage.
          detail: hiddenDetail ?? defaultMessage ?? null,
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error || "Failed to submit")
      toast({ title: "Thanks!", description: "Your report was sent to the technical team." })
      setOpen(false)
    } catch (e: any) {
      toast({ title: "Could not send report", description: e?.message || "Please try again.", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={triggerClassName}>
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Tell us what went wrong. We’ll include your page link, account (if logged in), and IP for troubleshooting.
          </p>
          <Textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What happened? Steps to reproduce help a lot."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Send to Technical Team</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
