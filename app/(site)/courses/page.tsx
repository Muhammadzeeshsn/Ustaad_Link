// app/courses/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { BrandButton } from '@/components/brand/BrandButton';
import { fadeUp, stagger } from '@/lib/motion'

import {
  BookOpen, Clock, Users, SlidersHorizontal, Tag, Loader2, RefreshCw, X,
} from 'lucide-react';

/* ======================== Types ======================== */
type Course = {
  id: string;
  title: string;
  description: string | null;
  type: 'personal' | 'cohort' | 'recorded' | string;
  level?: 'beginner' | 'intermediate' | 'advanced' | string | null;
  mode?: 'online' | 'in-person' | 'hybrid' | string | null;
  duration_weeks?: number | null;
  price?: number | null;
  cover_url?: string | null;
  seats?: number | null;
  is_published?: boolean | null;
  created_at?: string | null;
  tags?: string[] | null;
};

/* ======================== Brand & Motion ======================== */
const BRAND = '#0B1533'; // matches About page hero/navy



/* ======================== Data Fetching ======================== */
// Uses current backend if NEXT_PUBLIC_API_BASE is set; otherwise falls back to /api.
const COURSES_URL =
  (process.env.NEXT_PUBLIC_API_BASE
    ? `${process.env.NEXT_PUBLIC_API_BASE.replace(/\/+$/, '')}/v1/courses?published=1`
    : '/api/courses?published=1');

const fetcher = async (url: string): Promise<Course[]> => {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const text = await res.text();

  if (!res.ok) {
    // Don’t leak raw HTML or stack traces to the UI
    throw new Error('Request failed');
  }

  // Robust to different response shapes (array, {data:[]}, {items:[]})
  try {
    const json = JSON.parse(text);
    const data = Array.isArray(json) ? json : json?.data ?? json?.items ?? [];
    return (data ?? []) as Course[];
  } catch {
    // HTML or unexpected payload
    throw new Error('Unexpected response');
  }
};

/* ======================== Page ======================== */
export default function CoursesPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | 'personal' | 'cohort' | 'recorded'>('all');
  const [level, setLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [mode, setMode] = useState<'all' | 'online' | 'in-person' | 'hybrid'>('all');
  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  useEffect(() => { document.title = 'Courses | UstaadLink'; }, []);

  const { data, isLoading, error, mutate, isValidating } = useSWR<Course[]>(
    COURSES_URL,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const filtered = useMemo(() => {
    const list = (data ?? []).filter((c) => {
      const matchesQ =
        q.trim().length === 0 ||
        [c.title, c.description, ...(c.tags ?? [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q.toLowerCase());

      const matchesType = type === 'all' || (c.type ?? '').toLowerCase() === type;
      const matchesLevel = level === 'all' || (c.level ?? '').toLowerCase() === level;
      const matchesMode = mode === 'all' || (c.mode ?? '').toLowerCase() === mode;

      return matchesQ && matchesType && matchesLevel && matchesMode;
    });

    const byCreated = (a?: string | null, b?: string | null) =>
      new Date(b ?? 0).getTime() - new Date(a ?? 0).getTime();

    if (sort === 'newest') return list.sort((a, b) => byCreated(a.created_at, b.created_at));
    if (sort === 'price-asc') return list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === 'price-desc') return list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    return list;
  }, [data, q, type, level, mode, sort]);

  const total = data?.length ?? 0;

  function clearFilters() {
    setQ('');
    setType('all');
    setLevel('all');
    setMode('all');
    setSort('newest');
  }

  return (
    <main className="flex min-h-screen flex-col bg-white text-[color:var(--brand,#0B1533)]" style={{ ['--brand' as any]: BRAND }}>
      {/* HERO */}
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20" style={{ backgroundColor: BRAND }} />
        <section className="container mx-auto px-4 py-16 text-white md:py-24">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.h1 variants={fadeUp} className="text-4xl font-extrabold md:text-5xl">
              Courses
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-2 max-w-2xl text-white/90">
              Curated personal and cohort courses taught by verified tutors.
            </motion.p>

            {/* Search + Filters */}
            <motion.div
              variants={fadeUp}
              className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur supports-[backdrop-filter]:bg-white/10"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <SlidersHorizontal className="h-4 w-4" /> Refine results
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-5">
                {/* Search */}
                <label className="md:col-span-2">
                  <span className="sr-only">Search courses</span>
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search title, tags, description…"
                    className="bg-white/90 text-[color:var(--brand,#0B1533)] placeholder:text-white/70"
                  />
                </label>

                {/* Type */}
                <Select value={type} onChange={(v) => setType(v)} options={['all','personal','cohort','recorded']} label="Type" />

                {/* Level */}
                <Select value={level} onChange={(v) => setLevel(v as any)} options={['all','beginner','intermediate','advanced']} label="Level" />

                {/* Mode */}
                <Select value={mode} onChange={(v) => setMode(v as any)} options={['all','online','in-person','hybrid']} label="Mode" />

                {/* Sort */}
                <Select value={sort} onChange={(v) => setSort(v as any)} options={['newest','price-asc','price-desc']} label="Sort" prettyMap={{
                  'newest': 'Sort: Newest',
                  'price-asc': 'Sort: Price ↑',
                  'price-desc': 'Sort: Price ↓',
                }} />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-white/90">
                <div>
                  Showing <span className="font-semibold">{filtered.length}</span> of{' '}
                  <span className="font-semibold">{total}</span> courses
                </div>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 transition-colors hover:bg-white/20"
                >
                  <X className="h-3.5 w-3.5" /> Clear filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </header>

      {/* Separator */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand,#0B1533)]/30 to-transparent" />
      </div>

      {/* CONTENT */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        {isLoading ? (
          <CoursesSkeleton />
        ) : error ? (
          <ErrorBlock onRetry={() => mutate()} />
        ) : (filtered?.length ?? 0) === 0 ? (
          <EmptyState query={q} />
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
          </motion.div>
        )}

        {isValidating && !isLoading && (
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Updating…
          </div>
        )}
      </section>
    </main>
  );
}

/* ========================= Small UI Helpers ========================= */

function Select<T extends string>({
  value, onChange, options, label, prettyMap,
}: {
  value: T;
  onChange: (v: T) => void;
  options: T[];
  label: string;
  prettyMap?: Record<string, string>;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-xl border border-white/25 bg-white/90 px-3 py-2 text-sm text-[color:var(--brand,#0B1533)]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {prettyMap?.[o] ?? `${label}: ${o[0].toUpperCase()}${o.slice(1)}`}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ========================= Components ========================= */

function CourseCard({ course }: { course: Course }) {
  const { title, description, cover_url, type, level, duration_weeks, price, mode, tags } = course;
  const typeLabel = toTitle(type);
  const levelLabel = level ? toTitle(level) : 'Any Level';
  const modeLabel = mode ? toTitle(mode) : 'Flexible';
  const priceLabel = price != null ? `PKR ${price.toLocaleString()}` : 'Contact';

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-40 w-full bg-slate-100">
        {cover_url ? (
          <Image src={cover_url} alt={title} fill className="object-cover" sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[color:var(--brand,#0B1533)]/70">
            <BookOpen className="h-6 w-6" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>

      <div className="p-6">
        <h2 className="line-clamp-1 text-lg font-semibold text-[color:var(--brand,#0B1533)]">{title}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <Badge icon={<Users className="h-3.5 w-3.5" />}>{typeLabel}</Badge>
          <Badge icon={<Clock className="h-3.5 w-3.5" />}>{duration_weeks ? `${duration_weeks}w` : 'Flexible'}</Badge>
          <Badge>{levelLabel}</Badge>
          <Badge>{modeLabel}</Badge>
        </div>

        {tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 5).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
              >
                <Tag className="h-3 w-3" /> {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <div className="text-sm font-semibold text-[color:var(--brand,#0B1533)]">{priceLabel}</div>
          <BrandButton onClick={() => (window.location.href = '/auth')}>Enroll</BrandButton>
        </div>
      </div>
    </motion.article>
  );
}

function Badge({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[color:var(--brand,#0B1533)]"
      style={{ backgroundColor: 'color-mix(in oklab, var(--brand,#0B1533) 10%, white)' }}
    >
      {icon}
      {children}
    </span>
  );
}

function CoursesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-40 w-full bg-slate-100" />
          <div className="space-y-3 p-6">
            <div className="h-4 w-3/5 rounded bg-slate-100" />
            <div className="h-3 w-4/5 rounded bg-slate-100" />
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded bg-slate-100" />
              <div className="h-5 w-14 rounded bg-slate-100" />
              <div className="h-5 w-20 rounded bg-slate-100" />
            </div>
            <div className="h-8 w-24 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand,#0B1533)]/10 text-[color:var(--brand,#0B1533)]">
        <BookOpen className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-[color:var(--brand,#0B1533)]">No courses found</h3>
      <p className="mt-1 text-sm text-slate-600">
        {query.trim().length > 0
          ? `We couldn't find anything for “${query}”. Try a different keyword or clear filters.`
          : 'Please check back soon.'}
      </p>
    </div>
  );
}

function ErrorBlock({ onRetry }: { onRetry: () => void }) {
  // Intentionally generic to avoid surfacing raw backend errors/HTML
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
        <RefreshCw className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-[color:var(--brand,#0B1533)]">Couldn’t load courses</h3>
      <p className="mt-1 text-sm text-slate-600">
        We ran into a loading issue. Please try again. If this persists, check your API base URL.
      </p>
      <div className="mt-4">
        <BrandButton onClick={onRetry} className="inline-flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Try again
        </BrandButton>
      </div>
    </div>
  );
}

/* ========================= Utils ========================= */

function toTitle(v?: string | null): string {
  if (!v) return '';
  return v.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}
