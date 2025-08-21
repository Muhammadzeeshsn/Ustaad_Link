// app/contact/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { BrandButton } from '@/components/brand/BrandButton';
import { fadeUp, stagger } from '@/lib/motion'


import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Send,
} from 'lucide-react';

const BRAND = '#0B1533'; // keep in sync with About/Home
const HERO_IMAGE = '/images/hero-education.jpg';

/* Motion */

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});

  useEffect(() => {
    document.title = 'Contact | UstaadLink';
  }, []);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email],
  );
  const nameValid = name.trim().length >= 2;
  const messageValid = message.trim().length >= 10;
  const canSubmit = nameValid && emailValid && messageValid && !sending;
  const markTouched = (key: string) =>
    setTouched((t) => ({ ...t, [key]: true }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true, subject: true });
    if (!canSubmit) return;
    try {
      setSending(true);
      // TODO: Wire to current backend (example):
      // await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/v1/contact`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, subject, message }),
      // });
      await new Promise((r) => setTimeout(r, 900));
      toast({
        title: 'Message received',
        description:
          'Thanks for reaching out. Our team will reply shortly.',
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      toast({
        title: 'Something went wrong',
        description: 'Please try again or email hello@ustaadlink.com',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col bg-white text-[color:var(--brand,#0B1533)]"
      style={{ ['--brand' as any]: BRAND }}
    >
      {/* HERO — navy slab with soft image overlay (matches About) */}
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20" style={{ backgroundColor: BRAND }} />
        <div className="absolute inset-0 -z-10 opacity-20 mix-blend-overlay">
          <Image
            src={HERO_IMAGE}
            alt="Students learning with tutors"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        <section className="container mx-auto px-4 py-16 text-white md:py-24">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.h1
              variants={fadeUp}
              className="max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl"
            >
              Contact Us
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-3 max-w-2xl text-base text-white/90 md:text-lg"
            >
              We’re here to help—questions about tutors, Quran learning, pricing,
              or anything else. Expect a response within 24 hours.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-6">
              <BrandButton
                onClick={() =>
                  document
                    .getElementById('contact-form')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center"
              >
                Send a Message <ArrowRight className="ml-2 h-4 w-4" />
              </BrandButton>
            </motion.div>
          </motion.div>
        </section>
      </header>

      {/* Separator line (brand tint) */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand,#0B1533)]/30 to-transparent" />
      </div>

      {/* Quick cards */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <ContactCard
            icon={<Mail className="h-5 w-5" />}
            title="Email"
            content={
              <a
                href="mailto:hello@ustaadlink.com"
                className="text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline"
              >
                hello@ustaadlink.com
              </a>
            }
          />
          <ContactCard
            icon={<Phone className="h-5 w-5" />}
            title="Phone / WhatsApp"
            content={
              <a
                href="tel:+0000000000"
                className="text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline"
              >
                +00 000 0000
              </a>
            }
          />
          <ContactCard
            icon={<Clock className="h-5 w-5" />}
            title="Support hours"
            content={<span>Mon–Sat · 9:00–21:00 (PKT)</span>}
          />
          <ContactCard
            icon={<MapPin className="h-5 w-5" />}
            title="Location"
            content={<span>Lahore · Remote, Global</span>}
          />
        </motion.div>
      </section>

      {/* Form + Sidebar */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-8 md:grid-cols-5">
          <motion.form
            id="contact-form"
            onSubmit={onSubmit}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-[color:var(--brand,#0B1533)]">
              Send us a message
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Tell us a bit about your question—our team will get back to you.
            </p>

            <div className="mt-6 grid gap-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">
                  Full name
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onBlur={() => markTouched('name')}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={touched.name && !nameValid}
                  aria-describedby={touched.name && !nameValid ? 'name-err' : undefined}
                />
                {touched.name && !nameValid && (
                  <p id="name-err" className="mt-1 text-xs text-red-600">
                    Please enter at least 2 characters.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onBlur={() => markTouched('email')}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={touched.email && !emailValid}
                  aria-describedby={touched.email && !emailValid ? 'email-err' : undefined}
                />
                {touched.email && !emailValid && (
                  <p id="email-err" className="mt-1 text-xs text-red-600">
                    Please enter a valid email address.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="mb-1 block text-sm font-medium">
                  Subject <span className="text-slate-500">(optional)</span>
                </label>
                <Input
                  id="subject"
                  placeholder="e.g., Need a math tutor for A-Levels"
                  value={subject}
                  onBlur={() => markTouched('subject')}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="How can we help?"
                  value={message}
                  onBlur={() => markTouched('message')}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  aria-invalid={touched.message && !messageValid}
                  aria-describedby={touched.message && !messageValid ? 'msg-err' : undefined}
                />
                {touched.message && !messageValid && (
                  <p id="msg-err" className="mt-1 text-xs text-red-600">
                    Please enter at least 10 characters.
                  </p>
                )}
              </div>

              <div className="pt-2">
                <BrandButton
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          opacity="0.25"
                        />
                        <path
                          d="M22 12a10 10 0 0 1-10 10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send message
                    </>
                  )}
                </BrandButton>
              </div>
            </div>
          </motion.form>

          <motion.aside
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h3 className="text-base font-semibold text-[color:var(--brand,#0B1533)]">
              What to expect
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--brand,#0B1533)]" />
                A response within 24 hours (often much faster).
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--brand,#0B1533)]" />
                Help matching you with the right tutor and schedule.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--brand,#0B1533)]" />
                Guidance on pricing, trial sessions, and policies.
              </li>
            </ul>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-medium text-[color:var(--brand,#0B1533)]">
                Prefer WhatsApp?
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Message us at <span className="font-medium">+00 000 0000</span> and we’ll reply quickly.
              </p>
              <div className="mt-3">
                <BrandButton onClick={() => (window.location.href = 'tel:+0000000000')}>
                  Call now
                </BrandButton>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium text-[color:var(--brand,#0B1533)]">
                Popular links
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href="/teachers" className="text-sm text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline">
                  Featured teachers
                </a>
                <a href="/courses" className="text-sm text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline">
                  Courses
                </a>
                <a href="/requests" className="text-sm text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline">
                  Public requests
                </a>
                <a href="/faq" className="text-sm text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline">
                  FAQ
                </a>
                <a href="/pricing" className="text-sm text-[color:var(--brand,#0B1533)] underline-offset-2 hover:underline">
                  Pricing
                </a>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}

/* ===== Small card ===== */
function ContactCard({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute -inset-x-10 -top-10 h-20 rotate-6 bg-[color:var(--brand,#0B1533)]/10 blur-xl" />
      </div>
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand,#0B1533)]/10 text-[color:var(--brand,#0B1533)]">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[color:var(--brand,#0B1533)]">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{content}</p>
      <span className="mt-4 block h-px w-0 bg-[color:var(--brand,#0B1533)]/40 transition-[width] group-hover:w-full" />
    </motion.article>
  );
}
