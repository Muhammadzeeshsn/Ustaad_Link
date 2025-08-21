// app/auth/page.tsx
'use client';

import React, { useMemo, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BrandButton } from "@/components/brand/BrandButton";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, User, Phone, CheckCircle2 } from "lucide-react";
import { fadeUp, slideCard } from "@/lib/motion";

type Role = "student" | "tutor";
type Mode = "login" | "signup";

const BRAND = "#0B1533";
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const toUpperRole = (r: Role) => (r === "student" ? "STUDENT" : "TUTOR");
const normalizeEmail = (e: string) => e.trim().toLowerCase();

export default function AuthPage() {
  const [role, setRole] = useState<Role>("student");
  const [mode, setMode] = useState<Mode>("signup");
  const router = useRouter();
  const params = useSearchParams();
  const { toast, dismiss } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [inlineSuccess, setInlineSuccess] = useState<string | null>(null);

  // NEW: when a user logs in with the opposite role, show a card instead of redirecting
  const [roleMismatch, setRoleMismatch] = useState<null | "STUDENT" | "TUTOR">(null);

  const canSubmit = useMemo(() => {
    if (!emailOk(email) || password.length < 6) return false;
    if (mode === "signup" && name.trim().length < 2) return false;
    return true;
  }, [email, password, mode, name]);

  // Only accept internal callback URLs (avoid open redirects)
  const rawCallback = params.get("callbackUrl");
  const callbackUrl = rawCallback && rawCallback.startsWith("/") ? rawCallback : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setInlineError(null);
    setInlineSuccess(null);
    setRoleMismatch(null);

    try {
      const roleUpper = toUpperRole(role);
      const normalizedEmail = normalizeEmail(email);

      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: roleUpper,
            name,
            email: normalizedEmail,
            password,
            phone,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error ?? "Registration failed");

        setInlineSuccess("Account created. You can log in now.");
        toast({ title: "Account created", description: "You can log in now." });
        setMode("login");
      } else {
        const res = await signIn("credentials", {
          email: normalizedEmail,
          password,
          role: roleUpper, // hint for backend; session carries the real role
          redirect: false,
        });

        if (res?.ok) {
          // Get the actual role from the session we just created
          const session = await getSession();
          const actual = (session?.user as any)?.role as "STUDENT" | "TUTOR" | undefined;

          // If user logged in with a different role than the selected tab → show card, don't redirect
          if (actual && actual !== roleUpper) {
            setRoleMismatch(actual);
            return; // stay on auth page
          }

          // Roles match → go to intended dashboard (or callbackUrl)
          const dest = callbackUrl ?? (roleUpper === "STUDENT" ? "/dashboard/student" : "/dashboard/tutor");
          try { dismiss(); } catch {}
          await new Promise<void>((r) => requestAnimationFrame(() => r()));
          await new Promise<void>((r) => requestAnimationFrame(() => r()));
          router.replace(dest);
        } else {
          const message =
            res?.error === "CredentialsSignin"
              ? "Invalid email or password"
              : res?.error || "Unable to sign in";
          setInlineError(message);
          toast({ title: "Authentication error", description: message, variant: "destructive" });
        }
      }
    } catch (err: any) {
      const message = err?.message ?? "Please try again.";
      setInlineError(message);
      toast({ title: "Authentication error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col bg-white text-[color:var(--brand,#0B1533)]"
      style={{ ["--brand" as any]: BRAND }}
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
                <p className="mt-3 text-white/90">
                  One simple account—for Students & Tutors. Admin-reviewed for quality.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-white/95">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                    Admin-approved matching
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                    Track request status end-to-end
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                    Email verification built-in
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Right form panel */}
          <div className="bg-white p-6 md:p-8">
            <Tabs value={role} onValueChange={(v) => { setRole(v as Role); setRoleMismatch(null); }} className="w-full">
              <TabsList className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <TabsTrigger
                  value="student"
                  className="data-[state=active]:bg-[color:var(--brand,#0B1533)] data-[state=active]:text-white"
                >
                  Student
                </TabsTrigger>
                <TabsTrigger
                  value="tutor"
                  className="data-[state=active]:bg-[color:var(--brand,#0B1533)] data-[state=active]:text-white"
                >
                  Tutor
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {mode === "signup" ? "Create account" : "Log in"}
                  </h2>
                  <button
                    type="button"
                    className="text-sm font-medium text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline"
                    onClick={() => {
                      setInlineError(null);
                      setInlineSuccess(null);
                      setRoleMismatch(null);
                      setMode((m) => (m === "signup" ? "login" : "signup"));
                    }}
                  >
                    {mode === "signup" ? "Have an account? Log in" : "New here? Sign up"}
                  </button>
                </div>

                {/* WRONG-PORTAL CARD (only when user logged in with another role) */}
                {roleMismatch && (
                  <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                    <div className="text-sm font-semibold">You signed in as {roleMismatch.toLowerCase()}.</div>
                    <p className="mt-1 text-sm text-amber-700">
                      Please switch to the <strong>{roleMismatch.toLowerCase()}</strong> tab to continue.
                    </p>
                    <div className="mt-3 flex justify-center">
                      <BrandButton
                        type="button"
                        onClick={() => {
                          setRole(roleMismatch === "TUTOR" ? "tutor" : "student");
                          setRoleMismatch(null);
                        }}
                      >
                        Switch to {roleMismatch === "TUTOR" ? "Tutor" : "Student"} tab
                      </BrandButton>
                    </div>
                  </div>
                )}

                {inlineError && (
                  <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {inlineError}
                  </div>
                )}
                {inlineSuccess && (
                  <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {inlineSuccess}
                  </div>
                )}

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
                    {mode === "signup" && (
                      <>
                        <label className="block text-sm font-medium">
                          Full name
                          <div className="relative mt-1">
                            <Input
                              placeholder="Your name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              disabled={submitting}
                            />
                            <User className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                          </div>
                        </label>

                        <label className="block text-sm font-medium">
                          Phone (optional)
                          <div className="relative mt-1">
                            <Input
                              placeholder="+92 3xx xxxxxxx"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              disabled={submitting}
                            />
                            <Phone className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                          </div>
                        </label>
                      </>
                    )}

                    <label className="block text-sm font-medium">
                      Email
                      <div className="relative mt-1">
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={submitting}
                          required
                        />
                        <Mail className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                      </div>
                    </label>

                    <label className="block text-sm font-medium">
                      Password
                      <div className="relative mt-1">
                        <Input
                          type="password"
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={submitting}
                          required
                        />
                        <Lock className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                      </div>
                    </label>

                    <div className="pt-2">
                      <BrandButton
                        type="submit"
                        disabled={!canSubmit || submitting}
                        className="w-full"
                      >
                        {submitting
                          ? 'Please wait...'
                          : mode === "signup"
                          ? `Create ${role} account`
                          : "Log in"}
                      </BrandButton>
                    </div>

                    {mode === "signup" && role === "tutor" && (
                      <p className="text-xs text-slate-600">
                        After verifying your email, complete your profile in the tutor dashboard.
                      </p>
                    )}
                  </motion.form>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
