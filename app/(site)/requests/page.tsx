// app/requests/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { BrandButton } from '@/components/brand/BrandButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RefreshCw,
  Filter,
  Search,
  ClipboardList,
  Clock,
  MapPin,
  X,
} from 'lucide-react';

/* ======================== Brand & Motion ======================== */
const BRAND = '#0B1533'; // same navy used on About/Home

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};
const staggerList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ======================== Types & Fetcher ======================== */
type RequestRow = {
  id: string;
  title: string;
  details: string | null;
  category: 'hire_tutor' | 'hire_quran_tutor' | 'assignment_help' | string;
  location?: string | null; // city/district
  status:
    | 'pending_review'
    | 'approved'
    | 'rejected'
    | 'assigned'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | string;
  createdAt?: string;
  created_at?: string;
};

// Use current backend if NEXT_PUBLIC_API_BASE is set; else fall back to local API route
const REQUESTS_URL =
  (process.env.NEXT_PUBLIC_API_BASE
    ? `${process.env.NEXT_PUBLIC_API_BASE.replace(/\/+$/, '')}/v1/requests?status=approved`
    : '/api/requests?status=approved');

const fetcher = async (u: string): Promise<RequestRow[]> => {
  const res = await fetch(u, { headers: { Accept: 'application/json' } });
  const text = await res.text();

  if (!res.ok) throw new Error('Request failed');

  try {
    const json = JSON.parse(text);
    const data = Array.isArray(json) ? json : json?.data ?? json?.items ?? [];
    return (data ?? []) as RequestRow[];
  } catch {
    throw new Error('Unexpected response');
  }
};

/* ======================== Page ======================== */
export default function PublicRequestsPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<
    'all' | 'hire_tutor' | 'hire_quran_tutor' | 'assignment_help'
  >('all');
  const [location, setLocation] = useState<'all' | string>('all');

  const { data, isLoading, error, mutate } = useSWR<RequestRow[]>(REQUESTS_URL, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const list = data ?? [];

  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    for (const r of list) {
      const loc = (r.location ?? '').trim();
      if (loc) set.add(loc);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [list]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return list.filter((r) => {
      const matchQ =
        !ql ||
        `${r.title ?? ''} ${r.details ?? ''}`.toLowerCase().includes(ql);
      const matchC = category === 'all' || (r.category ?? '') === category;
      const matchL = location === 'all' || (r.location ?? '') === location;
      return matchQ && matchC && matchL;
    });
  }, [list, q, category, location]);

  const total = list.length;

  const clearFilters = () => {
    setQ('');
    setCategory('all');
    setLocation('all');
  };

  return (
    <main
      className="flex min-h-screen flex-col bg-white text-[color:var(--brand,#0B1533)]"
      style={{ ['--brand' as any]: BRAND }}
    >
      {/* HERO */}
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20" style={{ backgroundColor: BRAND }} />
        <section className="container mx-auto px-4 py-16 text-white md:py-20">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <h1 className="text-4xl font-extrabold md:text-5xl">Public Requests</h1>
            <p className="mt-2 max-w-2xl text-white/90">
              Browse student requests that have been approved by admin. Tutors can apply; students can track progress.
            </p>

            {/* Search + Filters */}
            <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur supports-[backdrop-filter]:bg-white/10">
              <div className="grid gap-3 md:grid-cols-6">
                {/* Search */}
                <label className="md:col-span-2">
                  <span className="sr-only">Search</span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 opacity-70" />
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search title or details…"
                      className="bg-white/90 pl-9 text-[color:var(--brand,#0B1533)] placeholder:text-white/70"
                    />
                  </div>
                </label>

                {/* Category */}
                <label>
                  <span className="sr-only">Category</span>
                  <div className="relative">
                    <Filter className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 opacity-70" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as typeof category)}
                      className="w-full rounded-xl border border-white/25 bg-white/90 px-8 py-2 text-sm text-[color:var(--brand,#0B1533)]"
                    >
                      <option value="all">All categories</option>
                      <option value="hire_tutor">Hire Tutor (Academics)</option>
                      <option value="hire_quran_tutor">Hire Quran Tutor</option>
                      <option value="assignment_help">Assignment / Project Help</option>
                    </select>
                  </div>
                </label>

                {/* Location (dynamic) */}
                <label>
                  <span className="sr-only">Location</span>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 opacity-70" />
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-white/25 bg-white/90 px-8 py-2 text-sm text-[color:var(--brand,#0B1533)]"
                    >
                      <option value="all">All locations</option>
                      {availableLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                {/* Count + Clear */}
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

                {/* Refresh */}
                <div className="hidden items-center justify-end md:flex">
                  <BrandButton onClick={() => mutate()} className="inline-flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </BrandButton>
                </div>
              </div>
              {/* Mobile refresh */}
              <div className="mt-3 flex items-center justify-end md:hidden">
                <BrandButton onClick={() => mutate()} className="inline-flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </BrandButton>
              </div>
            </div>
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
          <SkeletonGrid />
        ) : error ? (
          <ErrorBlock onRetry={() => mutate()} />
        ) : filtered.length === 0 ? (
          <EmptyBlock />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerList}
            className="grid gap-6 md:grid-cols-2"
          >
            {filtered.map((r) => (
              <motion.div key={r.id} variants={fadeUp}>
                <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-[color:var(--brand,#0B1533)]">
                          {r.title}
                        </CardTitle>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline">{(r.category ?? '').replace(/_/g, ' ')}</Badge>
                          {r.location && (
                            <Badge className="inline-flex items-center gap-1 bg-[color:var(--brand,#0B1533)]/10 text-[color:var(--brand,#0B1533)]">
                              <MapPin className="h-3 w-3" />
                              {r.location}
                            </Badge>
                          )}
                          <Badge className="bg-green-100 text-green-800">Approved</Badge>
                        </div>
                      </div>
                      <BrandButton onClick={() => (window.location.href = '/auth')}>Apply</BrandButton>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm text-slate-600">{r.details}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDate(r.createdAt ?? r.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
}

/* ========================= Helpers ========================= */

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm"
        />
      ))}
    </div>
  );
}

function ErrorBlock({ onRetry }: { onRetry: () => void }) {
  // Keep user-friendly; avoid surfacing raw backend/HTML errors
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
        <RefreshCw className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-[color:var(--brand,#0B1533)]">
        Couldn’t load requests
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        We ran into a loading issue. Please try again. If this keeps happening, check your API base URL.
      </p>
      <div className="mt-4">
        <BrandButton onClick={onRetry} className="inline-flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Try again
        </BrandButton>
      </div>
    </div>
  );
}

function EmptyBlock() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
        <ClipboardList className="h-5 w-5 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-[color:var(--brand,#0B1533)]">
        No approved requests yet
      </h3>
      <p className="mt-1 text-sm text-slate-600">Please check back soon.</p>
    </div>
  );
}
