'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock3, Tag, ArrowLeft } from 'lucide-react'
import { fadeUp } from '@/lib/motion'

type Post = {
  title: string
  date: string
  readMins: number
  tags: string[]
  hero: string
  author: string
  sections: { heading?: string; paragraphs: string[]; list?: string[] }[]
}

const POSTS: Record<string, Post> = {
  'how-to-choose-the-right-tutor': {
    title: 'How to Choose the Right Tutor for Your Learning Goals',
    date: '2025-08-01',
    readMins: 6,
    tags: ['Tutoring Tips', 'Guide', 'Parents'],
    hero: '/images/blog/choose-tutor.jpg',
    author: 'Team UstaadLink',
    sections: [
      { paragraphs: ['Picking the right tutor is less about buzzwords and more about fit — your goals, your learning style, and measurable outcomes.', 'Use this checklist to evaluate expertise, rapport, and clarity before you start.'] },
      { heading: 'A quick 5-point checklist', list: ['Define your goal: exam prep, concept mastery, or long-term mentorship.', 'Check specialization: relevant degree + proven results in your subject/level.', 'Evaluate fit: trial session, communication, and teaching style.', 'Agree on outcomes: milestones, reporting, and schedule.', 'Review credibility: ratings, testimonials, ID and profile verification.'], paragraphs: ['The right match reduces cost and time by focusing on what moves the needle for you.'] },
    ],
  },
  'online-learning-vs-traditional-classroom': {
    title: 'Online Learning vs Traditional Classroom: What Actually Works?',
    date: '2025-07-20',
    readMins: 7,
    tags: ['E-Learning', 'Comparison'],
    hero: '/images/blog/online-vs-classroom.jpg',
    author: 'Team UstaadLink',
    sections: [
      { paragraphs: ['Both modes work — the best choice depends on your constraints and preferences.'] },
      { heading: 'Online: strengths', list: ['Flexibility across time zones', 'Access to global tutors', 'Often more affordable'], paragraphs: [] },
      { heading: 'Classroom: strengths', list: ['In-person energy and accountability', 'Immediate group feedback', 'Campus facilities and community'], paragraphs: [] },
    ],
  },
  'top-10-study-hacks': {
    title: '10 Research-Backed Study Hacks to Boost Productivity',
    date: '2025-07-10',
    readMins: 5,
    tags: ['Study Skills', 'Students', 'Productivity'],
    hero: '/images/blog/study-hacks.jpg',
    author: 'Team UstaadLink',
    sections: [
      { paragraphs: ['Study smarter with tactics that compound: short focused bursts, spaced repetition, and active recall.'] },
      { heading: 'Try these this week', list: ['Pomodoro (25/5) + a daily focus goal', 'Teach a peer (forces clarity)', 'Spaced repetition flashcards', 'Plan sessions the night before', 'Block social distractions'], paragraphs: [] },
    ],
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>()
  const post = useMemo(() => (params?.slug ? POSTS[params.slug] : undefined), [params])

  useEffect(() => {
    if (post) document.title = `${post.title} | UstaadLink`
  }, [post])

  if (!post) {
    return (
      <main className="container py-16">
        <Link href="/blog" className="text-primary hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Post not found</h1>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-primary/10" />
        <section className="container px-4 pb-10 pt-8 md:pb-14 md:pt-12">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-2 md:items-end">
            <div>
              <Link href="/blog" className="text-primary hover:underline inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Blog
              </Link>
              <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">{post.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{post.author}</span>
                <span>•</span>
                <time className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(post.date)}</time>
                <span>•</span>
                <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" /> {post.readMins} min read</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
                    <Tag className="h-3 w-3" /> {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative h-48 w-full overflow-hidden rounded-2xl border bg-muted md:h-64">
              <img src={post.hero} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
            </div>
          </motion.div>
        </section>
      </header>

      <article className="container prose prose-neutral max-w-3xl px-4 py-10 dark:prose-invert md:py-14">
        {post.sections.map((s, i) => (
          <section key={i} className="mb-8">
            {s.heading ? <h2>{s.heading}</h2> : null}
            {s.paragraphs.map((p, idx) => <p key={idx}>{p}</p>)}
            {s.list && s.list.length > 0 ? <ul>{s.list.map((li) => <li key={li}>{li}</li>)}</ul> : null}
          </section>
        ))}
        <div className="mt-10 rounded-2xl border bg-card p-5 text-sm">
          Enjoyed this article? Share it or explore more on our{' '}
          <Link href="/blog" className="font-medium text-primary underline-offset-2 hover:underline">blog</Link>.
        </div>
      </article>
    </main>
  )
}
