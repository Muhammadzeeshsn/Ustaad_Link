'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, BookOpen } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion'



const steps = [
  { num: 1, title: 'Tell us your need', desc: 'Pick a category and share your subject, level, and schedule.', icon: BookOpen, tint: 'bg-primary/5' },
  { num: 2, title: 'We hand-match a tutor', desc: 'Our team verifies profiles and shortlists the best fit for you.', icon: Users, tint: 'bg-emerald-500/5' },
  { num: 3, title: 'Start learning', desc: 'Begin sessions with clear goals and track progress confidently.', icon: ShieldCheck, tint: 'bg-amber-400/10' },
];

export function HowItWorks() {
  return (
    <>
      <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">How it works</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <motion.article
              key={s.num}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -2 }}
              className={`group relative overflow-hidden rounded-2xl border ${s.tint} p-6 shadow-sm transition-shadow hover:shadow-lg`}
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              <span className="mt-4 block h-px w-0 bg-primary/40 transition-[width] group-hover:w-full" />
            </motion.article>
          );
        })}
      </div>
    </>
  );
}
