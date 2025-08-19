'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

type Testimonial = { name: string; role: string; text: string; avatarUrl?: string };

const DATA: Testimonial[] = [
  { name: 'Ayesha Khan', role: 'O/A Levels Student', text: 'I got a math tutor within a day. Clear communication and reliable matching. Improved my grade in two weeks!', avatarUrl: '/images/avatars/ayesha.jpg' },
  { name: 'Hamza Rauf', role: 'Parent', text: 'The Quran tutor was professional and punctual. My son looks forward to lessons—highly recommended.', avatarUrl: '/images/avatars/hamza.jpg' },
  { name: 'Sara Malik', role: 'Undergrad – CS', text: 'Public request flow made it super easy to compare tutors. The shortlist was spot on for my course needs.', avatarUrl: '/images/avatars/sara.jpg' },
  { name: 'Bilal Ahmed', role: 'Intermediate Student', text: 'Affordable and transparent. The admin review gave me confidence—sessions were smooth from day one.', avatarUrl: '/images/avatars/bilal.jpg' },
  { name: 'Noor Fatima', role: 'Parent', text: 'The tutor matched our schedule perfectly and kept my daughter engaged throughout.', avatarUrl: '/images/avatars/noor.jpg' },
];

function Avatar({ name, src, size = 44 }: { name: string; src?: string; size?: number }) {
  const [failed, setFailed] = React.useState(false);
  const initials = React.useMemo(
    () => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase(),
    [name]
  );
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary"
      style={{ width: size, height: size }}
    >
      {src && !failed ? (
        <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className="text-xs font-semibold">{initials}</span>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-black/5" />
    </div>
  );
}

export function TestimonialsCarousel() {
  const [perView, setPerView] = React.useState(1);
  const [index, setIndex] = React.useState(0);
  const total = DATA.length;

  React.useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      if (w >= 1024) setPerView(3);
      else if (w >= 768) setPerView(2);
      else setPerView(1);
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 4800);
    return () => clearInterval(id);
  }, [total]);

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);
  const x = `-${(index * 100) / perView}%`;

  return (
    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What students say</h2>
          <p className="mt-1 text-sm text-muted-foreground">Real stories from learners and parents in our community.</p>
        </div>
        <div className="hidden gap-2 md:flex">
          <button className="rounded-lg border px-2 py-2 text-sm hover:bg-primary/5" onClick={prev} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="rounded-lg border px-2 py-2 text-sm hover:bg-primary/5" onClick={next} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <motion.div
          className="flex"
          style={{ width: `${(total * 100) / perView}%` }}
          animate={{ x }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          {DATA.map((t, i) => (
            <div key={`${t.name}-${i}`} className="w-full shrink-0 basis-full px-2 sm:basis-1/2 lg:basis-1/3 lg:px-3">
              <motion.article
                whileHover={{ y: -3 }}
                className="group relative h-full overflow-hidden rounded-2xl border bg-card p-6 shadow-sm"
              >
                {/* subtle shine + ring on hover */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute -inset-x-10 -top-10 h-20 rotate-6 bg-white/10 blur-xl" />
                </div>
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-primary/0 transition-all group-hover:ring-2 group-hover:ring-primary/20" />

                <div className="flex items-center gap-4">
                  <Avatar name={t.name} src={t.avatarUrl} />
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>

                <blockquote className="mt-4 text-sm text-muted-foreground md:text-base">“{t.text}”</blockquote>

                <div className="mt-4 flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4" />
                  ))}
                </div>
              </motion.article>
            </div>
          ))}
        </motion.div>

      {/* Mobile control overlays */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-2 md:hidden">
          <button className="rounded-lg border px-2 py-2 text-sm hover:bg-primary/5" onClick={prev} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:hidden">
          <button className="rounded-lg border px-2 py-2 text-sm hover:bg-primary/5" onClick={next} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-all ${i === index ? 'w-5 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
