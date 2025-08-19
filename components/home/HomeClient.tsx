'use client';

import React, { useState } from 'react';
import { Section } from '@/components/brand/Section';
import { BrandButton } from '@/components/brand/BrandButton';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { TestimonialsCarousel } from '@/components/testimonials/TestimonialsCarousel';
import { RequestFlow, type RequestCategory } from '@/components/RequestFlow';
import { Users, BookOpen, ShieldCheck, Headphones, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function HeroCTA({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-lg active:translate-y-0"
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

export default function HomeClient() {
  const [requestOpen, setRequestOpen] = useState(false);
  const [category, setCategory] = useState<RequestCategory>('hire_tutor');

  const openWith = (c: RequestCategory) => {
    setCategory(c);
    setRequestOpen(true);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">

      {/* HERO (full-bleed bg but content constrained) */}
      <header className="relative w-full bg-[#0b1631] text-white">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-16 md:px-10 lg:py-24 xl:px-16">
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
            Find trusted tutors & Quran<br className="hidden md:block" /> teachers — fast, safe,<br className="hidden md:block" /> verified.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/85 md:text-base">
            Admin-reviewed workflows, public requests, featured teachers, and
            moderated profiles for a worry-free experience.
          </p>

          {/* top CTA pair */}
          <div className="mt-6 grid max-w-lg grid-cols-2 gap-3 sm:max-w-none sm:grid-cols-4">
            <HeroCTA onClick={() => openWith('hire_tutor')}>Hire Tutor</HeroCTA>
            <HeroCTA onClick={() => openWith('hire_quran_tutor')}>Hire Quran Tutor</HeroCTA>
            <HeroCTA onClick={() => openWith('assignment_help')}>Assignment/Project Help</HeroCTA>
            <Link href="/teachers" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-center text-sm font-semibold text-white/90 transition hover:bg-white/10">
              Become a Tutor
            </Link>
          </div>

          {/* trust pills */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/80 sm:grid-cols-4">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Admin-Reviewed</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Verified Tutors</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1">24/7 Support</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1">High Satisfaction</div>
          </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <Section>
        <HowItWorks />
      </Section>

      {/* FEATURE CARDS */}
      <Section>
        <FeatureCards />
      </Section>

      {/* STATS (soft band) */}
      <section className="w-full bg-muted/50">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-12 md:px-10 md:py-16 xl:px-16">
          <Stats />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Section>
        <TestimonialsCarousel />
      </Section>

      {/* Bottom CTA row */}
      <Section>
        <div className="rounded-2xl border bg-muted/40 p-5 md:p-8">
          <div className="text-base font-semibold">Ready to start?</div>
          <p className="text-sm text-muted-foreground">
            Tell us what you need — we will match you with a verified tutor.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            <BrandButton onClick={() => openWith('hire_tutor')}>Hire Tutor</BrandButton>
            <BrandButton onClick={() => openWith('hire_quran_tutor')}>Hire Quran Tutor</BrandButton>
            <BrandButton onClick={() => openWith('assignment_help')}>Assignment/Project Help</BrandButton>
            <BrandButton onClick={() => (window.location.href = '/teachers')}>Become a Tutor</BrandButton>
          </div>
        </div>
      </Section>

      {/* Request Modal (no Supabase) */}
      <RequestFlow
        open={requestOpen}
        onOpenChange={setRequestOpen}
        defaultCategory={category}
        onSubmit={async (payload) => {
          await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }}
      />
    </main>
  );
}

function FeatureCards() {
  const cards = [
    { title: 'Featured Teachers', desc: 'See admin-selected, top-rated tutors.', link: '/teachers', icon: Users },
    { title: 'Courses', desc: 'Admin-managed personal and cohort courses.', link: '/courses', icon: BookOpen },
    { title: 'Public Requests', desc: 'Discover admin-approved student requests.', link: '/requests', icon: ShieldCheck },
  ];
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon as any;
        return (
          <article key={c.title} className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg">
            <div className="mb-3 text-primary"><Icon className="h-5 w-5" /></div>
            <h3 className="text-xl font-semibold">{c.title}</h3>
            <p className="mt-1 text-muted-foreground">{c.desc}</p>
            <Link href={c.link} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">Explore →</Link>
          </article>
        );
      })}
    </div>
  );
}

function Stat({ kpi, label }: { kpi: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-extrabold">{kpi}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Stats() {
  return (
    <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
      <Stat kpi="1,200+" label="Tutors Available" />
      <Stat kpi="5,000+" label="Students Served" />
      <Stat kpi="98%" label="Satisfaction Rate" />
      <Stat kpi="24/7" label="Support" />
    </div>
  );
}
