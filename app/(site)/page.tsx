'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { animate } from 'framer-motion';
import { Section } from '@/components/brand/Section';
import { BrandButton } from '@/components/brand/BrandButton';
import {HowItWorks} from '@/components/sections/HowItWorks';
import { TestimonialsCarousel } from '@/components/testimonials/TestimonialsCarousel';
import { RequestFlow } from '@/components/RequestFlow';
import { Users, BookOpen, ShieldCheck, Headphones, Star, ArrowRight } from 'lucide-react';

type Category = 'hire_tutor' | 'hire_quran_tutor' | 'assignment_help' | 'project_help';
type RequestFlowProps = React.ComponentProps<typeof RequestFlow>;
const HERO_IMAGE = '/images/hero-education.jpg';

const inner = 'mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8';

/** Prominent hero button (solid, premium, subtle hover) */
function HeroCTA({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full inline-flex items-center justify-center gap-2 group',
        'rounded-xl px-5 py-3.5 text-sm font-semibold',
        'bg-primary text-primary-foreground',
        'border border-white/10 shadow-md shadow-primary/25',
        'transition-all will-change-transform',
        'hover:-translate-y-0.5 hover:shadow-lg hover:bg-primary/90',
        'active:translate-y-0 active:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'relative overflow-hidden',
        "before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity before:content-['']",
        'before:bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.16),transparent)]',
        'hover:before:opacity-100',
      ].join(' ')}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>();
  const [hasHeroImage, setHasHeroImage] = useState(true);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">


      {/* HERO */}
      <header className="relative isolate overflow-hidden bg-[#0b1631] text-white">
        {/* optional subtle image overlay */}
        {hasHeroImage && (
          <img
            src={HERO_IMAGE}
            alt="Students learning with a tutor"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-15 mix-blend-overlay"
            onError={() => setHasHeroImage(false)}
          />
        )}

        <div className={`${inner} py-16 md:py-24`}>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
            Find trusted tutors & Quran<br />teachers — fast, safe,<br />verified.
          </h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-white/80">
            Admin-reviewed workflows, public requests, featured teachers, and
            moderated profiles for a worry-free experience.
          </p>

          {/* 4 equal CTAs (row) */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroCTA onClick={() => { setCategory('hire_tutor'); setOpen(true); }}>
              Hire Tutor
            </HeroCTA>
            <HeroCTA onClick={() => { setCategory('hire_quran_tutor'); setOpen(true); }}>
              Hire Quran Tutor
            </HeroCTA>
            <HeroCTA onClick={() => { setCategory('assignment_help'); setOpen(true); }}>
              Assignment/Project Help
            </HeroCTA>
            <HeroCTA onClick={() => router.push('/auth')}>
              Become a Tutor
            </HeroCTA>
          </div>
        </div>
      </header>

      {/* TRUST BAR */}
      <div className="border-b bg-muted/40">
        <div className={`${inner} grid grid-cols-2 items-center gap-4 py-3 text-sm md:grid-cols-4`}>
          {[
            { icon: <ShieldCheck className="h-5 w-5" />, label: 'Admin-Reviewed' },
            { icon: <Users className="h-5 w-5" />, label: 'Verified Tutors' },
            { icon: <Headphones className="h-5 w-5" />, label: '24/7 Support' },
            { icon: <Star className="h-5 w-5" />, label: 'High Satisfaction' },
          ].map((it) => (
            <div key={it.label} className="flex items-center justify-center gap-2 text-muted-foreground">
              {it.icon}
              <span>{it.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <Section>
        <HowItWorks />
      </Section>

      {/* FEATURE CARDS */}
      <Section>
        <FeatureCards />
      </Section>

      {/* STATS */}
      <section className="relative bg-muted/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
        <div className={`${inner} py-14 md:py-16`}>
          <Stats />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Section>
        <TestimonialsCarousel />
      </Section>

      {/* BOTTOM CTA */}
      <Section>
        <div className={`${inner} rounded-2xl border bg-card p-6 md:p-8`}>
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Ready to start?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us what you need — we will match you with a verified tutor.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:w-auto">
              <BrandButton onClick={() => { setCategory('hire_tutor'); setOpen(true); }}>
                Hire Tutor
              </BrandButton>
              <BrandButton onClick={() => { setCategory('hire_quran_tutor'); setOpen(true); }}>
                Hire Quran Tutor
              </BrandButton>
              <BrandButton onClick={() => { setCategory('assignment_help'); setOpen(true); }}>
                Assignment/Project Help
              </BrandButton>
              <BrandButton onClick={() => router.push('/auth')}>
                Become a Tutor
              </BrandButton>
            </div>
          </div>
        </div>
      </Section>

      {/* Request Modal */}
      <RequestFlow
        open={open}
        onOpenChange={setOpen}
        defaultCategory={category as RequestFlowProps['defaultCategory']}
      />
    </main>
  );
}

/* ---------- Local pieces ---------- */

function FeatureCards() {
  const cards = [
    { title: 'Featured Teachers', desc: 'See admin-selected, top-rated tutors.', link: '/teachers', icon: Users },
    { title: 'Courses', desc: 'Admin-managed personal and cohort courses.', link: '/courses', icon: BookOpen },
    { title: 'Public Requests', desc: 'Discover admin-approved student requests.', link: '/requests', icon: ShieldCheck },
  ];
  return (
    <div className={`${inner}`}>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <article
              key={c.title}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="mb-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">{c.title}</h3>
              <p className="mt-1 text-muted-foreground">{c.desc}</p>
              <Link href={c.link} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                Explore →
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function CountTo({ value, duration = 0.8 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, duration]);
  return <span>{display.toLocaleString()}</span>;
}

function Stats() {
  const stats = [
    { value: 1200, suffix: '+', label: 'Tutors Available' },
    { value: 5000, suffix: '+', label: 'Students Served' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate' },
    { value: 24, suffix: '/7', label: 'Support' },
  ];
  return (
    <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="text-3xl font-extrabold tracking-tight text-primary">
            <CountTo value={s.value} />
            {s.suffix}
          </p>
          <p className="text-sm text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
