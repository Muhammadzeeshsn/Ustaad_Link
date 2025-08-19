'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { BrandButton } from '@/components/brand/BrandButton';
import { fadeUp, stagger } from '@/lib/motion'

import {
  Star,
  MapPin,
  GraduationCap,
  SlidersHorizontal,
  Loader2,
  RefreshCw,
  Bookmark,
  Clock,
  BookOpen,
  X,
} from 'lucide-react';

/* ========================= Brand & Motion ========================= */
const BRAND = '#0B1533';



/* ========================= Types ========================= */
type DBTutor = {
  user_id: string;
  bio: string | null;
  subjects: string[] | null;
  featured: boolean | null;
};

type TutorProfile = {
  user_id: string;
  bio: string | null;
  subjects: string[] | null;
  featured: boolean | null;

  // Optional UI fields (may be undefined if not in DB)
  full_name?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  hourly_rate?: number | null;
  years_experience?: number | null;
  rating?: number | null;
  reviews_count?: number | null;
};

/* ========================= Page ========================= */
export default function Teachers() {
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState<'all' | string>('all');
  const [sort, setSort] = useState<'featured' | 'name'>('featured');

  useEffect(() => {
    document.title = 'Featured Teachers | UstaadLink';
  }, []);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['featured-teachers'],
    queryFn: async (): Promise<TutorProfile[]> => {
      // Keep the select minimal to avoid column errors.
      const { data: rows, error: err } = await supabase
        .from('tutor_profiles')
        .select('user_id, bio, subjects, featured')
        .eq('status', 'approved')
        .eq('featured', true)
        .limit(48);

      if (err) throw err;

      return (rows ?? []).map((r: DBTutor) => ({
        user_id: r.user_id,
        bio: r.bio,
        subjects: r.subjects,
        featured: r.featured,
        // Optional UI fields (not selected here)
        full_name: undefined,
        avatar_url: undefined,
        location: undefined,
        hourly_rate: undefined,
        years_experience: undefined,
        rating: undefined,
        reviews_count: undefined,
      }));
    },
    refetchOnWindowFocus: false,
  });

  // Build subject filter options from data
  const subjectOptions = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((t) => (t.subjects ?? []).forEach((s) => set.add(s)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filtered = useMemo(() => {
    const list = (data ?? []).filter((t) => {
      const blob = [t.full_name, t.bio, ...(t.subjects ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesQ = q.trim().length === 0 || blob.includes(q.toLowerCase());
      const matchesSubject = subject === 'all' || (t.subjects ?? []).includes(subject);
      return matchesQ && matchesSubject;
    });

    if (sort === 'name') {
      return list.sort((a, b) => (a.full_name ?? '').localeCompare(b.full_name ?? ''));
    }
    return list; // 'featured' keeps DB order
  }, [data, q, subject, sort]);

  const total = data?.length ?? 0;

  const clearFilters = () => {
    setQ('');
    setSubject('all');
    setSort('featured');
  };

  return (
    <main
      className="flex min-h-screen flex-col bg-white text-[color:var(--brand,#0B1533)]"
      style={{ ['--brand' as any]: BRAND }}
    >
      {/* HERO */}
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20" style={{ backgroundColor: BRAND }} />
        <section className="container mx-auto px-4 py-16 text-white md:py-24">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.h1 variants={fadeUp} className="text-4xl font-extrabold md:text-5xl">
              Featured Teachers
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-2 max-w-2xl text-white/90">
              Hand-picked, admin-approved tutors with proven results. Browse by subject and connect instantly.
            </motion.p>

            {/* Search + Filters */}
            <motion.div
              variants={fadeUp}
              className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur supports-[backdrop-filter]:bg-white/10"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <SlidersHorizontal className="h-4 w-4" /> Refine results
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-6">
                {/* Search */}
                <label className="md:col-span-2">
                  <span className="sr-only">Search teachers</span>
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name, subject, bio…"
                    className="bg-white/90 text-[color:var(--brand,#0B1533)] placeholder:text-white/70"
                  />
                </label>

                {/* Subject */}
                <Select
                  label="Subject"
                  value={subject}
                  onChange={(v) => setSubject(v)}
                  options={['all', ...subjectOptions]}
                />

                {/* Sort (limited to reliable fields) */}
                <Select
                  label="Sort"
                  value={sort}
                  onChange={(v) => setSort(v as any)}
                  options={['featured', 'name']}
                  prettyMap={{
                    featured: 'Sort: Featured',
                    name: 'Sort: Name A–Z',
                  }}
                />

                {/* Result count + Clear */}
                <div className="flex items-center justify-between gap-3 md:col-span-2">
                  <div className="text-sm text-white/90">
                    Showing <span className="font-semibold">{filtered.length}</span> of{' '}
                    <span className="font-semibold">{total}</span>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm transition-colors hover:bg-white/20"
                  >
                    <X className="h-3.5 w-3.5" /> Clear filters
                  </button>
                </div>

                {/* CTA */}
                <div className="hidden items-center md:flex">
                  <BrandButton onClick={() => (window.location.href = '/auth')}>
                    Become a Tutor
                  </BrandButton>
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="mt-3 flex items-center justify-end md:hidden">
                <BrandButton onClick={() => (window.location.href = '/auth')}>
                  Become a Tutor
                </BrandButton>
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
          <TeachersSkeleton />
        ) : isError ? (
          <ErrorBlock
            message="We couldn't load teachers. Please try again."
            onRetry={refetch}
          />
        ) : filtered.length === 0 ? (
          <EmptyState query={q} />
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <TeacherCard key={t.user_id} t={t} />
            ))}
          </motion.div>
        )}

        {isFetching && !isLoading && (
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
  value,
  onChange,
  options,
  label,
  prettyMap,
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

function TeacherCard({ t }: { t: TutorProfile }) {
  const {
    user_id,
    full_name,
    avatar_url,
    bio,
    subjects,
    location,
    hourly_rate,
    years_experience,
    rating,
    reviews_count,
  } = t;

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Header strip */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Bookmark className="h-3.5 w-3.5" />
          <span>Featured</span>
        </div>
        {years_experience != null && (
          <div className="flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>{years_experience}y exp</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          <Avatar name={full_name ?? 'Featured Tutor'} src={avatar_url ?? undefined} />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-[color:var(--brand,#0B1533)]">
              {full_name ?? 'Featured Tutor'}
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              {location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
              {hourly_rate != null && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  PKR {hourly_rate.toLocaleString()}/hr
                </span>
              )}
              {rating != null && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-[color:var(--brand,#0B1533)]" />
                  {rating.toFixed(1)} {reviews_count ? `(${reviews_count})` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {bio && <p className="mt-3 line-clamp-3 text-sm text-slate-600">{bio}</p>}

        {/* Subjects */}
        {subjects && subjects.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {subjects.slice(0, 6).map((s) => (
              <span
                key={`${user_id}-${s}`}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
              >
                <BookOpen className="h-3 w-3" />
                {s}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-5 flex items-center justify-between">
          <div className="text-xs text-slate-500">Verified by UstaadLink</div>
          <BrandButton onClick={() => (window.location.href = '/auth')}>Hire Tutor</BrandButton>
        </div>
      </div>
    </motion.article>
  );
}

function Avatar({ name, src, size = 56 }: { name: string; src?: string; size?: number }) {
  const [failed, setFailed] = React.useState(false);
  const initials = React.useMemo(
    () => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase(),
    [name]
  );
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[color:var(--brand,#0B1533)]"
      style={{ width: size, height: size }}
    >
      {src && !failed ? (
        <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className="text-sm font-semibold">{initials}</span>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-black/5" />
    </div>
  );
}

function TeachersSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-10 w-full animate-pulse bg-slate-100" />
          <div className="space-y-3 p-6">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
            <div className="flex gap-2">
              <div className="h-5 w-16 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-14 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-8 w-24 animate-pulse rounded bg-slate-100" />
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
      <h3 className="text-lg font-semibold text-[color:var(--brand,#0B1533)]">No featured teachers</h3>
      <p className="mt-1 text-sm text-slate-600">
        {query.trim().length > 0
          ? `We couldn't find any results for “${query}”. Try a different keyword or clear filters.`
          : 'Please check back soon—new tutors are added regularly.'}
      </p>
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
        <RefreshCw className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-[color:var(--brand,#0B1533)]">Couldn’t load teachers</h3>
      <p className="mt-1 text-sm text-slate-600">{message}</p>
      <div className="mt-4">
        <BrandButton onClick={onRetry} className="inline-flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </BrandButton>
      </div>
    </div>
  );
}
