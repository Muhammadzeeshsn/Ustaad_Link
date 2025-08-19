'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock3, Tag, ArrowRight } from 'lucide-react'
import { fadeUp, stagger } from '@/lib/motion'

type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  readMins: number
  tags: string[]
  image: string
  author: string
}

const POSTS: BlogPost[] = [
  {
    slug: 'how-to-choose-the-right-tutor',
    title: 'How to Choose the Right Tutor for Your Learning Goals',
    excerpt:
      'Picking the right tutor saves time and money. Here’s a simple checklist to evaluate expertise, rapport, and outcomes.',
    date: '2025-08-01',
    readMins: 6,
    tags: ['Tutoring Tips', 'Guide', 'Parents'],
    image: '/images/blog/choose-tutor.jpg',
    author: 'Team UstaadLink',
  },
  {
    slug: 'online-learning-vs-traditional-classroom',
    title: 'Online Learning vs Traditional Classroom: What Actually Works?',
    excerpt:
      'Flexibility or structure? We compare outcomes, costs, and motivation so you can choose confidently.',
    date: '2025-07-20',
    readMins: 7,
    tags: ['E-Learning', 'Comparison'],
    image: '/images/blog/online-vs-classroom.jpg',
    author: 'Team UstaadLink',
  },
  {
    slug: 'top-10-study-hacks',
    title: '10 Research-Backed Study Hacks to Boost Productivity',
    excerpt:
      'From Pomodoro to active recall — turn scattered study sessions into real progress.',
    date: '2025-07-10',
    readMins: 5,
    tags: ['Study Skills', 'Students', 'Productivity'],
    image: '/images/blog/study-hacks.jpg',
    author: 'Team UstaadLink',
  },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Blog() {
  useEffect(() => { document.title = 'Blog | UstaadLink' }, [])
  const [featured, ...rest] = useMemo(() => POSTS, [])

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-primary/10" />
        <section className="container px-4 py-14 md:py-20">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-8 md:grid-cols-2">
            <motion.div variants={fadeUp}>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Insights & Tips</span>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Learn better with the UstaadLink blog</h1>
              <p className="mt-3 max-w-xl text-muted-foreground">Curated guides, study tactics, and platform updates — written for students, parents, and tutors.</p>
            </motion.div>

            <motion.article variants={fadeUp} className="group relative overflow-hidden rounded-3xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
              <div className="relative h-56 w-full bg-muted md:h-72">
                <img src={featured.image} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </div>
              <div className="p-6 md:p-7">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <time className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(featured.date)}</time>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{featured.readMins} min read</span>
                </div>
                <h2 className="mt-2 text-2xl font-semibold leading-snug">{featured.title}</h2>
                <p className="mt-2 line-clamp-3 text-muted-foreground">{featured.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {featured.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
                      <Tag className="h-3 w-3" /> {t}
                    </span>
                  ))}
                </div>
                <Link href={`/blog/${featured.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  Read article <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          </motion.div>
        </section>
      </header>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <section className="container px-4 pb-16 pt-8 md:pt-12">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <motion.article key={p.slug} variants={fadeUp} whileHover={{ y: -4 }} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
              <div className="relative h-44 w-full bg-muted">
                <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <time className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(p.date)}</time>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{p.readMins} min</span>
                </div>
                <h3 className="mt-2 line-clamp-2 text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                      <Tag className="h-3 w-3" /> {t}
                    </span>
                  ))}
                </div>
                <Link href={`/blog/${p.slug}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  Read more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>
    </main>
  )
}
