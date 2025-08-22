// app/auth/forgot/page.tsx
'use client';
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/brand/BrandButton";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

function useCountdown(from: number) {
  const [left, setLeft] = useState(from);
  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useState(() => {
      if (left <= 0) return;
      const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
      return () => clearInterval(t);
    });
  }
  return { left, set: setLeft };
}

export default function ForgotPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const role = (sp.get("role") || "STUDENT").toUpperCase();

  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { left, set } = useCountdown(0);

  async function start() {
    setErr(null);
    setBusy(true);
    try {
      const r = await fetch("/api/auth/otp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "reset", email: email.trim().toLowerCase(), role }),
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) {
        if (j?.error === "not_found") setErr("No account with this email for the selected role.");
        else if (j?.error === "cooldown") { setErr(undefined as any); set(j.remain || 45); }
        else setErr("Could not send code.");
        return;
      }
      setChallengeId(j.challengeId);
      set(j.cooldown || 45);
      setStep("otp");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!challengeId || code.length !== 6) return;
    setErr(null);
    setBusy(true);
    try {
      const r = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, code }),
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) {
        setErr(j?.error === "invalid_code" ? "Incorrect code." : j?.error === "expired" ? "Code expired." : "Verification failed.");
        return;
      }
      setStep("reset");
    } finally {
      setBusy(false);
    }
  }

  async function resetPwd() {
    if (password.length < 6) { setErr("Password too short."); return; }
    setErr(null);
    setBusy(true);
    try {
      const r = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) {
        setErr("Could not update password.");
        return;
      }
      router.push("/auth");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Reset your password</h1>
      {err && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      {step === "email" && (
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Email
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <BrandButton disabled={busy || !emailOk(email)} onClick={start}>Send code</BrandButton>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <div className="text-sm">Enter the 6-digit code we sent to <b>{email.trim().toLowerCase()}</b>.</div>
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <div className="flex items-center gap-3">
            <BrandButton disabled={code.length !== 6 || busy} onClick={verify}>Verify</BrandButton>
            <button disabled={left > 0} className="text-sm underline disabled:opacity-50" onClick={start}>
              {left > 0 ? `Resend in ${left}s` : "Resend code"}
            </button>
          </div>
        </div>
      )}

      {step === "reset" && (
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            New password
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </label>
          <BrandButton disabled={busy || password.length < 6} onClick={resetPwd}>Update password</BrandButton>
        </div>
      )}
    </main>
  )
}

function emailOk(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
