'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion'


import {
  Users,
  ShieldCheck,
  BookOpen,
  Headphones,
  Sparkles,
  Target,
  Heart,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

// IMPORTANT: Footer is NOT rendered here to avoid duplicates
// (assume your (marketing)/layout.tsx has it)

const HERO_IMAGE = '/images/hero-education.jpg';

/* -------------------- Animations (uniform) -------------------- */


/* -------------------- CTA (pill, navy) -------------------- */
function CTAButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-xl bg-[#0B1533] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0c173a] focus:outline-none focus:ring-2 focus:ring-[#0B1533]/40 active:translate-y-0"
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ================================================================
   Page
================================================================ */
export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-[#0B1533]">
      <Hero />
      <SectionDivider />

      <MissionModel />
      <CardsRow />

      <SectionDivider className="mt-12" />
      <ValueProps />

      <Tint>
        <Impact />
      </Tint>

      <SectionDivider />
      <Journey />

      <SectionDivider />
      <Team />

      <SectionDivider />
      <FAQ />

      <SectionDivider />
      <ClosingCTA />
    </main>
  );
}

/* ================================================================
   Sections
================================================================ */
function Hero() {
  return (
    <header className="relative isolate overflow-hidden">
      {/* navy slab */}
      <div className="absolute inset-0 -z-20 bg-[#0B1533]" />
      {/* soft overlayed image */}
      <div className="absolute inset-0 -z-10 opacity-20 mix-blend-overlay">
        <Image src={HERO_IMAGE} alt="Students learning with tutors" fill className="object-cover" priority sizes="100vw" />
      </div>

      <section className="container mx-auto px-6 py-20 text-white md:py-28">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-5xl">
          <motion.h1 variants={fadeUp} className="text-[42px] font-extrabold leading-tight md:text-6xl">
            About UstaadLink
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
            We connect learners with trusted tutors and Quran teachers through verified profiles,
            hand‑matched recommendations, and transparent workflows.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-6">
            <CTAButton href="/auth">Get Started</CTAButton>
            <CTAButton href="/contact">Contact Us</CTAButton>
          </motion.div>
        </motion.div>
      </section>
    </header>
  );
}

function SectionDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0B1533]/20 to-transparent" />
    </div>
  );
}

function MissionModel() {
  return (
    <section className="container mx-auto grid items-start gap-10 px-6 py-16 md:grid-cols-2 md:py-20">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <h2 className="text-3xl font-extrabold md:text-[32px]">Our Mission</h2>
        <p className="mt-3 max-w-[46ch] text-slate-600">
          To provide a safe, reliable, and accessible way for students to find expert tutors for academic subjects and
          Quran learning. We elevate quality by verifying profiles, moderating requests, and curating top teachers.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <h2 className="text-3xl font-extrabold md:text-[32px]">Our Model</h2>
        <p className="mt-3 max-w-[46ch] text-slate-600">
          UstaadLink combines admin‑reviewed onboarding with a guided request flow. Students share their needs; our team
          shortlists the best matches. Public requests, featured teachers, and transparent reviews help everyone make
          confident decisions.
        </p>
      </motion.div>
    </section>
  );
}

/* cards under Mission/Model in your screenshots */
function CardsRow() {
  const items = [
    {
      icon: ShieldCheck,
      title: 'Verified & Safe',
      desc: 'Admin‑reviewed profiles, ID checks, and moderated listings keep the marketplace trustworthy.',
    },
    {
      icon: Users,
      title: 'Human‑Matched',
      desc: 'We shortlist tutors who match your subject, level, and schedule—no guesswork.',
    },
    {
      icon: Headphones,
      title: 'Responsive Support',
      desc: 'Our team is available to clarify, mediate, and assist throughout your learning journey.',
    },
  ];
  return (
    <section className="container mx-auto px-6 pb-6">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map(({ icon: Icon, title, desc }) => (
          <motion.article
            key={title}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#0B1533]">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-[18px] font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function ValueProps() {
  const items = [
    { icon: Target, title: 'Outcome‑Focused', desc: 'Clear goals, structured plans, and progress tracking.' },
    { icon: BookOpen, title: 'Breadth & Depth', desc: 'School, college, university, and Quran—across many subjects.' },
    { icon: Sparkles, title: 'Quality First', desc: 'Featured tutors are curated based on performance and feedback.' },
    { icon: Heart, title: 'Community Impact', desc: 'Fair, respectful, and uplifting interactions for tutors and learners.' },
  ];
  return (
    <section className="container mx-auto px-6 py-16 md:py-20">
      <h2 className="text-3xl font-extrabold md:text-[32px]">What we value</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <motion.article
            key={title}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#0B1533]">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-[16px] font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            <span className="mt-4 block h-px w-24 bg-slate-200" />
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Tint({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative bg-slate-50">
      <div className="container mx-auto px-6 py-16 md:py-20">{children}</div>
    </section>
  );
}

function Impact() {
  const stats = [
    { value: '1,200+', label: 'Tutors Onboarded' },
    { value: '5,000+', label: 'Students Served' },
    { value: '98%', label: 'Satisfaction Score' },
    { value: '24/7', label: 'Human Support' },
  ];
  return (
    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
      <motion.h2 variants={fadeUp} className="text-3xl font-extrabold md:text-[32px]">
        Our impact
      </motion.h2>
      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="rounded-2xl border border-slate-200 bg-white p-8 text-center"
          >
            <p className="text-3xl font-extrabold tracking-tight text-[#0B1533] md:text-[28px]">{s.value}</p>
            <p className="mt-1 text-sm text-slate-600">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function Journey() {
  const items = [
    { year: '2023', title: 'Idea & Validation', desc: 'Spoke with students & parents; mapped pain points in tutor discovery.' },
    { year: '2024', title: 'MVP & Launch', desc: 'Built verified onboarding, public requests, and featured tutors.' },
    { year: '2025', title: 'Scale & Quality', desc: 'Expanding categories, improving matching, and enhancing oversight.' },
  ];
  return (
    <section className="container mx-auto px-6 py-16 md:py-20">
      <h2 className="text-3xl font-extrabold md:text-[32px]">Our journey</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map((t) => (
          <motion.article
            key={t.year}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="text-xs font-semibold text-slate-500">{t.year}</div>
            <h3 className="mt-2 text-[18px] font-semibold text-[#0B1533]">{t.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{t.desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Team() {
  const team = [
    { name: 'Abdur Rehman', role: 'Founder & Product', img: '/images/team/zeeshan.jpg' },
    { name: 'Ayesha Siddiqui', role: 'Operations Lead', img: '/images/team/ayesha.jpg' },
    { name: 'Hamza Rauf', role: 'Engineering', img: '/images/team/hamza.jpg' },
    { name: 'Sara Malik', role: 'Student Success', img: '/images/team/sara.jpg' },
  ];
  return (
    <section className="container mx-auto px-6 py-16 md:py-20">
      <h2 className="text-3xl font-extrabold md:text-[32px]">Meet the team</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        {team.map((m) => (
          <motion.article
            key={m.name}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <Avatar name={m.name} src={m.img} size={56} />
            <div className="mt-4 text-[15px] font-semibold text-[#0B1533]">{m.name}</div>
            <div className="text-xs text-slate-600">{m.role}</div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Avatar({ name, src, size = 56 }: { name: string; src?: string; size?: number }) {
  const [failed, setFailed] = React.useState(false);
  const initials = React.useMemo(() => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase(), [name]);
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[#0B1533]"
      style={{ width: size, height: size }}
    >
      {src && !failed ? (
        <Image src={src} alt={name} width={size} height={size} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className="text-xs font-semibold">{initials}</span>
      )}
    </div>
  );
}

function FAQ() {
  const items = [
    { q: 'How does tutor matching work?', a: 'Share your subject, level, and schedule. Our team verifies profiles and shortlists the best tutors for your needs.' },
    { q: 'Are tutors verified?', a: 'Yes. We review IDs, qualifications, and references. Featured tutors are curated for sustained performance.' },
    { q: 'Do you support Quran learning?', a: 'Absolutely. We have Quran tutors for Nazra, Hifz, Tajweed, and more—with flexible time zones.' },
    { q: 'What if I need help during the process?', a: 'Our support team is available for clarifications, adjustments, and mediation when needed.' },
  ];
  return (
    <section className="container mx-auto px-6 py-16 md:py-20">
      <h2 className="text-3xl font-extrabold md:text-[32px]">FAQs</h2>
      <div className="mt-6 divide-y rounded-2xl border border-slate-200 bg-white">
        {items.map((f, i) => (
          <details key={i} className="group">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40">
              <span className="text-[15px] font-semibold text-[#0B1533]">{f.q}</span>
              <span className="mt-1 text-[#0B1533]">
                <CheckCircle className="h-4 w-4 transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <div className="px-5 pb-5 pt-0 text-sm leading-6 text-slate-600">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="container mx-auto px-6 py-16 md:py-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-[24px] font-extrabold text-[#0B1533]">Join our learning community</h3>
            <p className="mt-1 text-sm text-slate-600">
              Start a request, or register as a tutor—both paths are guided and verified.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <CTAButton href="/auth">Get Started</CTAButton>
            <CTAButton href="/auth">Become a Tutor</CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}
