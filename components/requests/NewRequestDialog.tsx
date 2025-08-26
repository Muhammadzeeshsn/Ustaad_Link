// components/requests/NewRequestDialog.tsx
'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { BookOpen, PenLine, GraduationCap } from 'lucide-react'
import { fadeUp as fade } from '@/lib/motion'

export type RequestCategory = 'HIRE_TUTOR' | 'HIRE_QURAN' | 'PROJECT_HELP'
type Mode = 'online' | 'onsite' | 'hybrid'

type CommonFields = {
  title: string
  description: string
  budgetMin?: number | null
  budgetMax?: number | null
  currency?: string | null
  mode?: Mode
  // contact + address
  contactName?: string | null
  contactPhone?: string | null
  contactEmail?: string | null
  reqAddressLine?: string | null
  reqCountryCode?: string | null
  reqStateCode?: string | null
  reqCityName?: string | null
  reqZip?: string | null
  preferredLanguage?: string | null
}

type TutorFields = CommonFields & {
  subject: string
  level?: string
  schedule?: string
  startDate?: string
  cityPref?: string | null // legacy; not sent anymore
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
  userId?: string
}

export function NewRequestDialog({ open, onOpenChange, userId }: NewRequestDialogProps) {
  const { toast } = useToast()

  const [step, setStep] = React.useState<'pick' | 'form' | 'review'>('pick')
  const [category, setCategory] = React.useState<RequestCategory | null>(null)
  const [useProfile, setUseProfile] = React.useState(false)
  const [loadingProfile, setLoadingProfile] = React.useState(false)

  const [tutorData, setTutorData] = React.useState<TutorFields>({
    title: '',
    description: '',
    subject: '',
    level: '',
    schedule: '',
    startDate: '',
    budgetMin: undefined,
    budgetMax: undefined,
    currency: undefined,
    mode: 'online',
    cityPref: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    reqAddressLine: '',
    reqCountryCode: '',
    reqStateCode: '',
    reqCityName: '',
    reqZip: '',
    preferredLanguage: '',
  })

  const [assignmentData, setAssignmentData] = React.useState<AssignmentFields>({
    title: '',
    description: '',
    subject: '',
    deadline: '',
    budgetMin: undefined,
    budgetMax: undefined,
    currency: undefined,
    mode: 'online',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    reqAddressLine: '',
    reqCountryCode: '',
    reqStateCode: '',
    reqCityName: '',
    reqZip: '',
    preferredLanguage: '',
  })

  React.useEffect(() => {
    if (!open) {
      setStep('pick')
      setCategory(null)
      setUseProfile(false)
      setTutorData({
        title: '',
        description: '',
        subject: '',
        level: '',
        schedule: '',
        startDate: '',
        budgetMin: undefined,
        budgetMax: undefined,
        currency: undefined,
        mode: 'online',
        cityPref: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        reqAddressLine: '',
        reqCountryCode: '',
        reqStateCode: '',
        reqCityName: '',
        reqZip: '',
        preferredLanguage: '',
      })
      setAssignmentData({
        title: '',
        description: '',
        subject: '',
        deadline: '',
        budgetMin: undefined,
        budgetMax: undefined,
        currency: undefined,
        mode: 'online',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        reqAddressLine: '',
        reqCountryCode: '',
        reqStateCode: '',
        reqCityName: '',
        reqZip: '',
        preferredLanguage: '',
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
      return d.title.trim().length >= 3 && d.subject.trim().length >= 2 && d.description.trim().length >= 10
    }
    const d = tutorData
    return d.title.trim().length >= 3 && d.subject.trim().length >= 2 && d.description.trim().length >= 10
  }, [category, assignmentData, tutorData])

  async function hydrateFromProfile() {
    try {
      setLoadingProfile(true)
      const res = await fetch('/api/students/me', { credentials: 'include' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Failed to load profile')

      const profile = json as {
        name?: string | null
        phone?: string | null
        addressLine?: string | null
        countryCode?: string | null
        stateCode?: string | null
        cityName?: string | null
        zip?: string | null
      }

      if (category === 'PROJECT_HELP') {
        setAssignmentData((prev) => ({
          ...prev,
          contactName: profile.name ?? prev.contactName,
          contactPhone: profile.phone ?? prev.contactPhone,
          reqAddressLine: profile.addressLine ?? prev.reqAddressLine,
          reqCountryCode: profile.countryCode ?? prev.reqCountryCode,
          reqStateCode: profile.stateCode ?? prev.reqStateCode,
          reqCityName: profile.cityName ?? prev.reqCityName,
          reqZip: profile.zip ?? prev.reqZip,
        }))
      } else if (category) {
        setTutorData((prev) => ({
          ...prev,
          contactName: profile.name ?? prev.contactName,
          contactPhone: profile.phone ?? prev.contactPhone,
          reqAddressLine: profile.addressLine ?? prev.reqAddressLine,
          reqCountryCode: profile.countryCode ?? prev.reqCountryCode,
          reqStateCode: profile.stateCode ?? prev.reqStateCode,
          reqCityName: profile.cityName ?? prev.reqCityName,
          reqZip: profile.zip ?? prev.reqZip,
        }))
      }
    } catch (err: any) {
      setUseProfile(false)
    } finally {
      setLoadingProfile(false)
    }
  }

  React.useEffect(() => {
    if (useProfile && category) void hydrateFromProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useProfile, category])

  async function onSubmit() {
    if (!category) return
    const d = category === 'PROJECT_HELP' ? assignmentData : tutorData

    try {
      const payload = {
        title: d.title,
        description: d.description,
        type: category,
        subject: d.subject || null,

        // time & language
        schedule: category === 'PROJECT_HELP' ? null : (tutorData.schedule || null),
        deadline: category === 'PROJECT_HELP' ? (assignmentData.deadline || null) : null,
        preferredLanguage: d.preferredLanguage || null,

        // money/mode
        budgetMin: d.budgetMin ?? null,
        budgetMax: d.budgetMax ?? null,
        currency: d.currency ?? null,
        mode: d.mode ?? 'online',

        // contact
        contactName: d.contactName || null,
        contactPhone: d.contactPhone || null,
        contactEmail: d.contactEmail || null,

        // full address
        reqAddressLine: d.reqAddressLine || null,
        reqCountryCode: d.reqCountryCode || null,
        reqStateCode: d.reqStateCode || null,
        reqCityName: d.reqCityName || null,
        reqZip: d.reqZip || null,

        // behavior flag for server to merge profile if needed
        useProfile,

        userId, // optional; backend defaults to session
      }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error ?? 'Failed to create request')

      // success
      onOpenChange(false)
    } catch (err: any) {
      // surface API validation errors (e.g., missing fields for onsite)
      alert(err?.message ?? 'Failed to submit')
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
                  <PickCard icon={<GraduationCap className="h-6 w-6" />} title="Hire Tutor" desc="Subject experts for school, college & beyond." onClick={() => handlePick('HIRE_TUTOR')} />
                  <PickCard icon={<BookOpen className="h-6 w-6" />} title="Hire Quran Tutor" desc="Quran reading, Tajweed & Islamic studies." onClick={() => handlePick('HIRE_QURAN')} />
                  <PickCard icon={<PenLine className="h-6 w-6" />} title="Assignment / Project" desc="Get help with assignments & projects." onClick={() => handlePick('PROJECT_HELP')} />
                </div>
              </motion.div>
            )}

            {step === 'form' && category && (
              <motion.div key="form" variants={fade} initial="hidden" animate="visible" exit="exit">
                <div className="mb-3 flex items-center justify-between gap-3">
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

                  <div className="flex items-center gap-2">
                    <label className="text-xs">Use my profile info</label>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={useProfile}
                      onChange={(e) => setUseProfile(e.target.checked)}
                      disabled={loadingProfile}
                      title="Copy contact and address from your profile"
                    />
                  </div>
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
                      placeholder={category === 'PROJECT_HELP'
                        ? 'e.g., Need help with DBMS assignment'
                        : 'e.g., Looking for a Math tutor (Grade 9)'}
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

                  {/* Currency */}
                  <div>
                    <label className="mb-1 block text-xs font-medium">Currency</label>
                    <Input
                      value={(category === 'PROJECT_HELP' ? assignmentData.currency : tutorData.currency) ?? ''}
                      onChange={(e) =>
                        category === 'PROJECT_HELP'
                          ? setAssignmentData({ ...assignmentData, currency: e.target.value })
                          : setTutorData({ ...tutorData, currency: e.target.value })
                      }
                      placeholder="e.g., PKR / USD"
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

                  {/* Contact */}
                  <div className="sm:col-span-2 mt-2 grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium">Contact Name</label>
                      <Input
                        value={category === 'PROJECT_HELP' ? (assignmentData.contactName ?? '') : (tutorData.contactName ?? '')}
                        onChange={(e) =>
                          category === 'PROJECT_HELP'
                            ? setAssignmentData({ ...assignmentData, contactName: e.target.value })
                            : setTutorData({ ...tutorData, contactName: e.target.value })
                        }
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">Contact Phone</label>
                      <Input
                        value={category === 'PROJECT_HELP' ? (assignmentData.contactPhone ?? '') : (tutorData.contactPhone ?? '')}
                        onChange={(e) =>
                          category === 'PROJECT_HELP'
                            ? setAssignmentData({ ...assignmentData, contactPhone: e.target.value })
                            : setTutorData({ ...tutorData, contactPhone: e.target.value })
                        }
                        placeholder="03xx-xxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">Contact Email (optional)</label>
                      <Input
                        type="email"
                        value={category === 'PROJECT_HELP' ? (assignmentData.contactEmail ?? '') : (tutorData.contactEmail ?? '')}
                        onChange={(e) =>
                          category === 'PROJECT_HELP'
                            ? setAssignmentData({ ...assignmentData, contactEmail: e.target.value })
                            : setTutorData({ ...tutorData, contactEmail: e.target.value })
                        }
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-medium">Address Line</label>
                      <Input
                        value={category === 'PROJECT_HELP' ? (assignmentData.reqAddressLine ?? '') : (tutorData.reqAddressLine ?? '')}
                        onChange={(e) =>
                          category === 'PROJECT_HELP'
                            ? setAssignmentData({ ...assignmentData, reqAddressLine: e.target.value })
                            : setTutorData({ ...tutorData, reqAddressLine: e.target.value })
                        }
                        placeholder="Street / Area"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">City</label>
                      <Input
                        value={category === 'PROJECT_HELP' ? (assignmentData.reqCityName ?? '') : (tutorData.reqCityName ?? '')}
                        onChange={(e) =>
                          category === 'PROJECT_HELP'
                            ? setAssignmentData({ ...assignmentData, reqCityName: e.target.value })
                            : setTutorData({ ...tutorData, reqCityName: e.target.value })
                        }
                        placeholder="e.g., Lahore"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">State / Province</label>
                      <Input
                        value={category === 'PROJECT_HELP' ? (assignmentData.reqStateCode ?? '') : (tutorData.reqStateCode ?? '')}
                        onChange={(e) =>
                          category === 'PROJECT_HELP'
                            ? setAssignmentData({ ...assignmentData, reqStateCode: e.target.value })
                            : setTutorData({ ...tutorData, reqStateCode: e.target.value })
                        }
                        placeholder="e.g., PB"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">Country Code</label>
                      <Input
                        value={category === 'PROJECT_HELP' ? (assignmentData.reqCountryCode ?? '') : (tutorData.reqCountryCode ?? '')}
                        onChange={(e) =>
                          category === 'PROJECT_HELP'
                            ? setAssignmentData({ ...assignmentData, reqCountryCode: e.target.value })
                            : setTutorData({ ...tutorData, reqCountryCode: e.target.value })
                        }
                        placeholder="e.g., PK"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium">ZIP / Postal</label>
                      <Input
                        value={category === 'PROJECT_HELP' ? (assignmentData.reqZip ?? '') : (tutorData.reqZip ?? '')}
                        onChange={(e) =>
                          category === 'PROJECT_HELP'
                            ? setAssignmentData({ ...assignmentData, reqZip: e.target.value })
                            : setTutorData({ ...tutorData, reqZip: e.target.value })
                        }
                        placeholder="e.g., 54000"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium">Details</label>
                    <Textarea
                      value={category === 'PROJECT_HELP' ? assignmentData.description : tutorData.description}
                      onChange={(e) =>
                        category === 'PROJECT_HELP'
                          ? setAssignmentData({ ...assignmentData, description: e.target.value })
                          : setTutorData({ ...tutorData, description: e.target.value })
                      }
                      placeholder={
                        category === 'PROJECT_HELP'
                          ? 'Describe the assignment/project, tools, rubric, and expectations…'
                          : 'Describe your goals, learning challenges, and expectations…'
                      }
                      className="min-h-[96px]"
                    />
                  </div>

                  {/* Language (optional) */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium">Preferred Language (optional)</label>
                    <Input
                      value={category === 'PROJECT_HELP' ? (assignmentData.preferredLanguage ?? '') : (tutorData.preferredLanguage ?? '')}
                      onChange={(e) =>
                        category === 'PROJECT_HELP'
                          ? setAssignmentData({ ...assignmentData, preferredLanguage: e.target.value })
                          : setTutorData({ ...tutorData, preferredLanguage: e.target.value })
                      }
                      placeholder="e.g., English / Urdu"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep('pick')}>Back</Button>
                  <Button disabled={!canContinueForm} onClick={() => setStep('review')}>Continue</Button>
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
                      value={category === 'PROJECT_HELP' ? 'Assignment / Project' : category === 'HIRE_QURAN' ? 'Quran Tutor' : 'Tutor'}
                    />
                    <Row label="Subject" value={category === 'PROJECT_HELP' ? assignmentData.subject : tutorData.subject} />
                    <Row label="Mode" value={(category === 'PROJECT_HELP' ? assignmentData.mode : tutorData.mode) ?? '—'} />
                    <Row
                      label="Budget"
                      value={`${(category === 'PROJECT_HELP' ? assignmentData.budgetMin : tutorData.budgetMin) ?? '—'} - ${(category === 'PROJECT_HELP' ? assignmentData.budgetMax : tutorData.budgetMax) ?? '—'} ${(category === 'PROJECT_HELP' ? assignmentData.currency : tutorData.currency) ?? ''}`}
                    />
                    {category !== 'PROJECT_HELP' ? (
                      <>
                        <Row label="Level" value={tutorData.level || '—'} />
                        <Row label="Schedule" value={tutorData.schedule || '—'} />
                        <Row label="Start Date" value={tutorData.startDate || '—'} />
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
                        {category === 'PROJECT_HELP' ? assignmentData.description : tutorData.description}
                      </dd>
                    </div>

                    {/* Contact review */}
                    <div className="sm:col-span-2 mt-2 grid gap-2 sm:grid-cols-3">
                      <Row label="Contact Name" value={category === 'PROJECT_HELP' ? assignmentData.contactName : tutorData.contactName} />
                      <Row label="Contact Phone" value={category === 'PROJECT_HELP' ? assignmentData.contactPhone : tutorData.contactPhone} />
                      <Row label="Contact Email" value={category === 'PROJECT_HELP' ? assignmentData.contactEmail : tutorData.contactEmail} />
                    </div>

                    {/* Address review */}
                    <div className="sm:col-span-2 mt-2 grid gap-2 sm:grid-cols-2">
                      <Row label="Address" value={category === 'PROJECT_HELP' ? assignmentData.reqAddressLine : tutorData.reqAddressLine} />
                      <Row
                        label="Region"
                        value={
                          [
                            category === 'PROJECT_HELP' ? assignmentData.reqCityName : tutorData.reqCityName,
                            category === 'PROJECT_HELP' ? assignmentData.reqStateCode : tutorData.reqStateCode,
                            category === 'PROJECT_HELP' ? assignmentData.reqCountryCode : tutorData.reqCountryCode,
                          ].filter(Boolean).join(', ') || '—'
                        }
                      />
                      <Row label="ZIP" value={category === 'PROJECT_HELP' ? assignmentData.reqZip : tutorData.reqZip} />
                    </div>

                    {/* Language */}
                    <div className="sm:col-span-2">
                      <Row label="Preferred Language" value={category === 'PROJECT_HELP' ? assignmentData.preferredLanguage : tutorData.preferredLanguage} />
                    </div>
                  </dl>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep('form')}>Back</Button>
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

function PickCard({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
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
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  )
}
