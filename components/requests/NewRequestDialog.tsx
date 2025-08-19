// components/requests/NewRequestDialog.tsx
'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { BookOpen, PenLine, GraduationCap } from 'lucide-react'
import { fadeUp as fade } from '@/lib/motion'

/* ── Types ───────────────────────────────────────────────
   Align categories with your Prisma enums / API contract. */
export type RequestCategory = 'HIRE_TUTOR' | 'HIRE_QURAN' | 'PROJECT_HELP'

type Mode = 'online' | 'onsite' | 'hybrid'

type CommonFields = {
  title: string
  details: string
  budgetMin?: number | null
  budgetMax?: number | null
  mode?: Mode
}

type TutorFields = CommonFields & {
  subject: string
  level?: string
  schedule?: string
  startDate?: string
  cityPref?: string | null
}

type AssignmentFields = CommonFields & {
  subject: string
  deadline?: string
}

type FormState =
  | { category: 'HIRE_TUTOR'; data: TutorFields }
  | { category: 'HIRE_QURAN'; data: TutorFields }
  | { category: 'PROJECT_HELP'; data: AssignmentFields }

export interface NewRequestDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** Optional; your API can also resolve user from cookies/JWT */
  userId?: string
}

/* ── Component ────────────────────────────────────────── */

export function NewRequestDialog({ open, onOpenChange, userId }: NewRequestDialogProps) {
  const { toast } = useToast()

  const [step, setStep] = React.useState<'pick' | 'form' | 'review'>('pick')
  const [category, setCategory] = React.useState<RequestCategory | null>(null)

  const [tutorData, setTutorData] = React.useState<TutorFields>({
    title: '',
    details: '',
    subject: '',
    level: '',
    schedule: '',
    startDate: '',
    budgetMin: undefined,
    budgetMax: undefined,
    mode: 'online',
    cityPref: '',
  })

  const [assignmentData, setAssignmentData] = React.useState<AssignmentFields>({
    title: '',
    details: '',
    subject: '',
    deadline: '',
    budgetMin: undefined,
    budgetMax: undefined,
    mode: 'online',
  })

  React.useEffect(() => {
    if (!open) {
      setStep('pick')
      setCategory(null)
      setTutorData({
        title: '',
        details: '',
        subject: '',
        level: '',
        schedule: '',
        startDate: '',
        budgetMin: undefined,
        budgetMax: undefined,
        mode: 'online',
        cityPref: '',
      })
      setAssignmentData({
        title: '',
        details: '',
        subject: '',
        deadline: '',
        budgetMin: undefined,
        budgetMax: undefined,
        mode: 'online',
      })
    }
  }, [open])

  const handlePick = (cat: RequestCategory) => {
    setCategory(cat)
    setStep('form')
  }

  const canContinueForm = React.useMemo(() => {
    if (!category) return false
    if (category === 'PROJECT_HELP') {
      const d = assignmentData
      return d.title.trim().length >= 3 && d.subject.trim().length >= 2 && d.details.trim().length >= 10
    }
    const d = tutorData
    return d.title.trim().length >= 3 && d.subject.trim().length >= 2 && d.details.trim().length >= 10
  }, [category, assignmentData, tutorData])

  async function onSubmit() {
    try {
      if (!category) return

      // Minimal, API-friendly payload.
      // Your /api/requests route can persist extra fields or pack them into a JSON column if needed.
      const payload =
        category === 'PROJECT_HELP'
          ? {
              title: assignmentData.title,
              description: assignmentData.details,
              type: category,
              subject: assignmentData.subject,
              deadline: assignmentData.deadline || null,
              budgetMin: assignmentData.budgetMin ?? null,
              budgetMax: assignmentData.budgetMax ?? null,
              mode: assignmentData.mode ?? 'online',
              userId, // optional
            }
          : {
              title: tutorData.title,
              description: tutorData.details,
              type: category,
              subject: tutorData.subject,
              level: tutorData.level || null,
              schedule: tutorData.schedule || null,
              startDate: tutorData.startDate || null,
              budgetMin: tutorData.budgetMin ?? null,
              budgetMax: tutorData.budgetMax ?? null,
              mode: tutorData.mode ?? 'online',
              cityPref: tutorData.cityPref || null,
              userId, // optional
            }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error ?? 'Failed to create request')

      toast({ title: 'Request submitted', description: 'Our team will review and match the best tutor.' })
      onOpenChange(false)
    } catch (err: any) {
      toast({
        title: 'Failed to submit',
        description: err?.message ?? 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden bg-card p-0">
        <DialogHeader className="px-6 pb-0 pt-6">
          <DialogTitle className="text-xl">New Request</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-2">
          <AnimatePresence mode="wait">
            {step === 'pick' && (
              <motion.div key="pick" variants={fade} initial="hidden" animate="visible" exit="exit">
                <p className="text-sm text-muted-foreground">What are you looking for today? Choose one:</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <PickCard
                    icon={<GraduationCap className="h-6 w-6" />}
                    title="Hire Tutor"
                    desc="Subject experts for school, college & beyond."
                    onClick={() => handlePick('HIRE_TUTOR')}
                  />
                  <PickCard
                    icon={<BookOpen className="h-6 w-6" />}
                    title="Hire Quran Tutor"
                    desc="Quran reading, Tajweed & Islamic studies."
                    onClick={() => handlePick('HIRE_QURAN')}
                  />
                  <PickCard
                    icon={<PenLine className="h-6 w-6" />}
                    title="Assignment / Project"
                    desc="Get help with assignments & projects."
                    onClick={() => handlePick('PROJECT_HELP')}
                  />
                </div>
              </motion.div>
            )}

            {step === 'form' && category && (
              <motion.div key="form" variants={fade} initial="hidden" animate="visible" exit="exit">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">
                      {category === 'PROJECT_HELP'
                        ? 'Assignment/Project Details'
                        : category === 'HIRE_QURAN'
                        ? 'Quran Tutor Details'
                        : 'Tutor Request Details'}
                    </h3>
                    <p className="text-xs text-muted-foreground">Provide details to help us match you accurately.</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setStep('pick')}>
                    Change
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Title */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium">Title</label>
                    <Input
                      value={category === 'PROJECT_HELP' ? assignmentData.title : tutorData.title}
                      onChange={(e) =>
                        category === 'PROJECT_HELP'
                          ? setAssignmentData({ ...assignmentData, title: e.target.value })
                          : setTutorData({ ...tutorData, title: e.target.value })
                      }
                      placeholder={
                        category === 'PROJECT_HELP'
                          ? 'e.g., Need help with DBMS assignment'
                          : 'e.g., Looking for a Math tutor (Grade 9)'
                      }
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="mb-1 block text-xs font-medium">Subject</label>
                    <Input
                      value={category === 'PROJECT_HELP' ? assignmentData.subject : tutorData.subject}
                      onChange={(e) =>
                        category === 'PROJECT_HELP'
                          ? setAssignmentData({ ...assignmentData, subject: e.target.value })
                          : setTutorData({ ...tutorData, subject: e.target.value })
                      }
                      placeholder={category === 'HIRE_QURAN' ? 'Quran (Tajweed / Hifz / Nazra)' : 'e.g., Math, Physics, Programming'}
                    />
                  </div>

                  {/* Mode */}
                  <div>
                    <label className="mb-1 block text-xs font-medium">Mode</label>
                    <select
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                      value={category === 'PROJECT_HELP' ? assignmentData.mode : tutorData.mode}
                      onChange={(e) =>
                        category === 'PROJECT_HELP'
                          ? setAssignmentData({ ...assignmentData, mode: e.target.value as Mode })
                          : setTutorData({ ...tutorData, mode: e.target.value as Mode })
                      }
                    >
                      <option value="online">Online</option>
                      <option value="onsite">In-person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="mb-1 block text-xs font-medium">Budget (min)</label>
                    <Input
                      type="number"
                      value={(category === 'PROJECT_HELP' ? assignmentData.budgetMin : tutorData.budgetMin) ?? ''}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : undefined
                        category === 'PROJECT_HELP'
                          ? setAssignmentData({ ...assignmentData, budgetMin: v })
                          : setTutorData({ ...tutorData, budgetMin: v })
                      }}
                      placeholder="e.g., 2000"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Budget (max)</label>
                    <Input
                      type="number"
                      value={(category === 'PROJECT_HELP' ? assignmentData.budgetMax : tutorData.budgetMax) ?? ''}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : undefined
                        category === 'PROJECT_HELP'
                          ? setAssignmentData({ ...assignmentData, budgetMax: v })
                          : setTutorData({ ...tutorData, budgetMax: v })
                      }}
                      placeholder="e.g., 6000"
                    />
                  </div>

                  {/* Tutor-specific */}
                  {category !== 'PROJECT_HELP' && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Level (optional)</label>
                        <Input
                          value={tutorData.level ?? ''}
                          onChange={(e) => setTutorData({ ...tutorData, level: e.target.value })}
                          placeholder="e.g., Grade 9 / O-Level / University"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Preferred Schedule (optional)</label>
                        <Input
                          value={tutorData.schedule ?? ''}
                          onChange={(e) => setTutorData({ ...tutorData, schedule: e.target.value })}
                          placeholder="e.g., Mon / Wed / Fri, 6-7pm PKT"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Start Date (optional)</label>
                        <Input
                          type="date"
                          value={tutorData.startDate ?? ''}
                          onChange={(e) => setTutorData({ ...tutorData, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">City (for in-person)</label>
                        <Input
                          value={tutorData.cityPref ?? ''}
                          onChange={(e) => setTutorData({ ...tutorData, cityPref: e.target.value })}
                          placeholder="e.g., Lahore / Karachi (optional)"
                        />
                      </div>
                    </>
                  )}

                  {/* Assignment-specific */}
                  {category === 'PROJECT_HELP' && (
                    <div>
                      <label className="mb-1 block text-xs font-medium">Deadline</label>
                      <Input
                        type="datetime-local"
                        value={assignmentData.deadline ?? ''}
                        onChange={(e) => setAssignmentData({ ...assignmentData, deadline: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium">Details</label>
                    <Textarea
                      value={category === 'PROJECT_HELP' ? assignmentData.details : tutorData.details}
                      onChange={(e) =>
                        category === 'PROJECT_HELP'
                          ? setAssignmentData({ ...assignmentData, details: e.target.value })
                          : setTutorData({ ...tutorData, details: e.target.value })
                      }
                      placeholder={
                        category === 'PROJECT_HELP'
                          ? 'Describe the assignment/project, tools, rubric, and expectations…'
                          : 'Describe your goals, learning challenges, and expectations…'
                      }
                      className="min-h-[96px]"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep('pick')}>
                    Back
                  </Button>
                  <Button disabled={!canContinueForm} onClick={() => setStep('review')}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'review' && category && (
              <motion.div key="review" variants={fade} initial="hidden" animate="visible" exit="exit">
                <h3 className="text-base font-semibold">Review & Submit</h3>
                <p className="text-xs text-muted-foreground">Please confirm the information below.</p>

                <div className="mt-3 rounded-xl border bg-muted/40 p-4 text-sm">
                  <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Row
                      label="Category"
                      value={
                        category === 'PROJECT_HELP'
                          ? 'Assignment / Project'
                          : category === 'HIRE_QURAN'
                          ? 'Quran Tutor'
                          : 'Tutor'
                      }
                    />
                    <Row label="Subject" value={category === 'PROJECT_HELP' ? assignmentData.subject : tutorData.subject} />
                    <Row label="Mode" value={(category === 'PROJECT_HELP' ? assignmentData.mode : tutorData.mode) ?? '—'} />
                    <Row
                      label="Budget"
                      value={`${(category === 'PROJECT_HELP' ? assignmentData.budgetMin : tutorData.budgetMin) ?? '—'} - ${(category === 'PROJECT_HELP' ? assignmentData.budgetMax : tutorData.budgetMax) ?? '—'}`}
                    />

                    {category !== 'PROJECT_HELP' ? (
                      <>
                        <Row label="Level" value={tutorData.level || '—'} />
                        <Row label="Schedule" value={tutorData.schedule || '—'} />
                        <Row label="Start Date" value={tutorData.startDate || '—'} />
                        <Row label="City" value={tutorData.cityPref || '—'} />
                      </>
                    ) : (
                      <Row label="Deadline" value={assignmentData.deadline || '—'} />
                    )}

                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Title</dt>
                      <dd className="font-medium">{category === 'PROJECT_HELP' ? assignmentData.title : tutorData.title}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Details</dt>
                      <dd className="whitespace-pre-wrap">
                        {category === 'PROJECT_HELP' ? assignmentData.details : tutorData.details}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep('form')}>
                    Back
                  </Button>
                  <Button onClick={onSubmit}>Submit Request</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Small parts ───────────────────────────────────────── */

function PickCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full flex-col justify-between rounded-2xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="inline-flex rounded-xl bg-primary/10 p-2 text-primary ring-1 ring-primary/15">{icon}</div>
      <div className="mt-3">
        <div className="font-semibold">{title}</div>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </button>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
