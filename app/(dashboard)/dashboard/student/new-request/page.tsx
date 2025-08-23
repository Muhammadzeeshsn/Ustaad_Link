'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Country, State, City } from 'country-state-city'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useToast } from '@/components/ui/use-toast'

/* -------------------- constants & helpers -------------------- */

const SUBJECTS = [
  'Mathematics',
  'Additional Mathematics',
  'Statistics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Programming',
  'Algorithms',
  'Data Structures',
  'English',
  'Urdu',
  'Islamiyat',
  'Pakistan Studies',
  'History',
  'Geography',
  'Economics',
  'Accounting',
  'Business Studies',
  'Marketing',
  'Finance',
  'Sociology',
  'Psychology',
  'Philosophy',
  'Law',
  'Arabic',
  'French',
  'Quran',
  'Tajweed',
  'Hadith',
  'Tafseer',
]

const onlyDigits = (s: string) => s.replace(/[^0-9]/g, '')
const isFutureOrToday = (d: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const t = new Date(d)
  t.setHours(0, 0, 0, 0)
  return t.getTime() >= today.getTime()
}
const isAfter = (a: string, b: string) => new Date(a).getTime() > new Date(b).getTime()

async function safeJson(r: Response) {
  const ct = r.headers.get('content-type') || ''
  if (!ct.includes('application/json')) return null
  const t = await r.text()
  if (!t) return null
  try {
    return JSON.parse(t)
  } catch {
    return null
  }
}

/* -------------------- shared UI blocks -------------------- */

function AddressBlock({
  value,
  onChange,
  onOpenChange,
}: {
  value: any
  onChange: (v: any) => void
  onOpenChange: (open: boolean) => void
}) {
  const countries = useMemo(
    () => Country.getAllCountries().map((c) => ({ name: c.name, code: c.isoCode })),
    [],
  )
  const states = useMemo(
    () =>
      value.countryCode
        ? State.getStatesOfCountry(value.countryCode).map((s) => ({ name: s.name, code: s.isoCode }))
        : [],
    [value.countryCode],
  )
  const cities = useMemo(
    () =>
      value.countryCode && value.stateCode
        ? City.getCitiesOfState(value.countryCode, value.stateCode).map((c) => ({ name: c.name }))
        : [],
    [value.countryCode, value.stateCode],
  )

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Country</Label>
          <Select
            onOpenChange={onOpenChange}
            value={value.countryCode || ''}
            onValueChange={(v) => onChange({ ...value, countryCode: v, stateCode: '', cityName: '' })}
          >
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="z-50 max-h-64 bg-background shadow-lg">
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>State / Province</Label>
          <Select
            onOpenChange={onOpenChange}
            value={value.stateCode || ''}
            onValueChange={(v) => onChange({ ...value, stateCode: v, cityName: '' })}
            disabled={!value.countryCode}
          >
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue placeholder={value.countryCode ? 'Select state' : 'Select country first'} />
            </SelectTrigger>
            <SelectContent className="z-50 max-h-64 bg-background shadow-lg">
              {states.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>City</Label>
          <Select
            onOpenChange={onOpenChange}
            value={value.cityName || ''}
            onValueChange={(v) => onChange({ ...value, cityName: v })}
            disabled={!value.stateCode}
          >
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue placeholder={value.stateCode ? 'Select city' : 'Select state first'} />
            </SelectTrigger>
            <SelectContent className="z-50 max-h-64 bg-background shadow-lg">
              {cities.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Postal / ZIP</Label>
          <Input
            value={value.zip || ''}
            onChange={(e) => onChange({ ...value, zip: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
      </div>

      <div>
        <Label>Specific Address</Label>
        <Input
          value={value.addressLine || ''}
          onChange={(e) => onChange({ ...value, addressLine: e.target.value })}
          placeholder="House, street, area"
          className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
        />
      </div>
    </div>
  )
}

function Budget({ f, setF }: { f: any; setF: (x: any) => void }) {
  const invalid = f.budgetMin && f.budgetMax && Number(f.budgetMax) < Number(f.budgetMin)
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="group">
        <Label>Budget Min</Label>
        <div className="flex items-center gap-2">
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            value={f.budgetMin}
            onChange={(e) => setF({ ...f, budgetMin: onlyDigits(e.target.value) })}
            className="flex-1 border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
          <Select value={f.currency} onValueChange={(v) => setF({ ...f, currency: v })}>
            <SelectTrigger className="h-10 w-24 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              <SelectItem value="PKR">PKR</SelectItem>
              <SelectItem value="USD">$ USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="group">
        <Label>Budget Max</Label>
        <Input
          inputMode="numeric"
          pattern="[0-9]*"
          value={f.budgetMax}
          onChange={(e) => setF({ ...f, budgetMax: onlyDigits(e.target.value) })}
          className={`border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 ${
            invalid ? 'border-red-500 focus-visible:border-red-600' : 'focus-visible:border-primary'
          }`}
        />
      </div>

      {invalid && <p className="text-xs text-red-600">Max budget must be greater than min budget.</p>}
    </div>
  )
}

function AutocompleteSubjects({
  subjects,
  setSubjects,
}: {
  subjects: string[]
  setSubjects: (s: string[]) => void
}) {
  const [q, setQ] = useState('')
  const suggestions = useMemo(
    () => SUBJECTS.filter((s) => s.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8),
    [q],
  )
  function add(v: string) {
    const val = v.trim()
    if (!val) return
    if (!subjects.includes(val)) setSubjects([...subjects, val])
    setQ('')
  }
  function remove(v: string) {
    setSubjects(subjects.filter((s) => s !== v))
  }
  return (
    <div>
      <Label>Subjects</Label>
      <div className="relative mt-1">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(q)
            }
          }}
          placeholder="Start typing and select…"
          className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
        />
        {q && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
            {suggestions.length ? (
              suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s)}
                  className="block w-full px-3 py-2 text-left hover:bg-muted"
                >
                  {s}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Press Enter to add “{q}”
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {subjects.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
          >
            {s}
            <button type="button" className="opacity-70 hover:opacity-100" onClick={() => remove(s)}>
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

async function submitRequest(
  body: any,
  toast: any,
  setSuccess: (x: boolean) => void,
  setLastError?: (s: string | null) => void,
) {
  if (body.budgetMin && body.budgetMax && Number(body.budgetMax) < Number(body.budgetMin))
    return toast({
      title: 'Budget range error',
      description: 'Max must be greater than min.',
      variant: 'destructive',
    })
  if (body.preferredTimeStart && !isFutureOrToday(body.preferredTimeStart))
    return toast({
      title: 'Invalid start date',
      description: 'Start must be today or later.',
      variant: 'destructive',
    })
  if (body.preferredTimeStart && body.preferredTimeEnd && !isAfter(body.preferredTimeEnd, body.preferredTimeStart))
    return toast({
      title: 'Invalid completion date',
      description: 'Completion must be after start date.',
      variant: 'destructive',
    })

  try {
    const r = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, status: 'pending_review' }),
    })
    const j = await safeJson(r)
    if (!r.ok) throw new Error((j as any)?.error || 'Failed to create request.')
    setLastError?.(null)
    setSuccess(true)
  } catch (e: any) {
    const msg = e?.message || 'Failed to create request.'
    setLastError?.(msg)
    toast({ title: 'Error', description: msg, variant: 'destructive' })
  }
}

function SuccessPanel() {
  return (
    <div className="grid place-items-center rounded-2xl border bg-green-50 p-8 text-center">
      <div className="text-2xl font-semibold text-green-700">Request submitted!</div>
      <p className="mt-2 max-w-[60ch] text-sm text-green-700/80">
        Your request is marked as <span className="font-semibold">pending review</span>. Please hold tight while our admin verifies it.
        You’ll be notified here when a tutor is assigned or messages you.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard/student">
          <Button>Back to Dashboard</Button>
        </Link>
        <Link href="/dashboard/student/new-request">
          <Button variant="outline">Post Another</Button>
        </Link>
      </div>
    </div>
  )
}

/* -------------------- page -------------------- */

export default function NewReq() {
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2>(1)
  const [type, setType] = useState<'PROJECT_HELP' | 'HIRE_TUTOR' | 'HIRE_QURAN' | null>(null)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [hasProfileAddress, setHasProfileAddress] = useState(false)
  const [hasProfileContact, setHasProfileContact] = useState(false)
  const [success, setSuccess] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/students/me')
        const j = await safeJson(r)
        const d = (j as any)?.data || {}
        setHasProfileAddress(!!(d.addressLine || d.location) && !!d.countryCode && !!d.stateCode && !!d.cityName)
        setHasProfileContact(!!d.name && !!d.phone)
      } catch {
        // ignore
      }
    })()
  }, [])

  function begin(t: any) {
    setType(t)
    setStep(2)
  }

  return (
    <div className="container max-w-3xl pb-16 pt-6">
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/student">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Post a Request</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Global dropdown overlay for better readability */}
      {overlayOpen && <div className="fixed inset-0 z-40 bg-background/85 md:bg-background/70" />}

      {/* Error panel with Report link */}
      {lastError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {lastError}{' '}
          <a
            href={`mailto:admin@ustaadlink.com?subject=${encodeURIComponent(
              'Student Portal • Request creation failed',
            )}&body=${encodeURIComponent(
              `Path: /dashboard/student/new-request\n\nError:\n${lastError}\n\nSteps to reproduce:`,
            )}`}
            className="ml-2 inline-flex items-center rounded border border-red-300 bg-white px-2 py-0.5 text-xs hover:bg-red-100"
          >
            Report this to Admin
          </a>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-b from-primary/5 to-transparent">
          <CardTitle>Post a Request</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {success ? (
            <SuccessPanel />
          ) : step === 1 ? (
            <div className="grid min-h-[36vh] place-items-center">
              <div className="grid w-full max-w-2xl grid-cols-1 gap-5 md:grid-cols-3">
                <CenterOption
                  title="Assignment / Project Help"
                  desc="Submit details for guided help"
                  color="blue"
                  onClick={() => begin('PROJECT_HELP')}
                />
                <CenterOption
                  title="Hire Tutor"
                  desc="Find a subject specialist"
                  color="green"
                  onClick={() => begin('HIRE_TUTOR')}
                />
                <CenterOption
                  title="Hire Quran Tutor"
                  desc="Qaida, Tajweed, Tafseer, Hifz"
                  color="purple"
                  onClick={() => begin('HIRE_QURAN')}
                />
              </div>
            </div>
          ) : (
            <>
              {type === 'PROJECT_HELP' && (
                <ProjectHelp
                  onBack={() => setStep(1)}
                  setOverlayOpen={setOverlayOpen}
                  hasProfileAddress={hasProfileAddress}
                  hasProfileContact={hasProfileContact}
                  setSuccess={setSuccess}
                  setLastError={setLastError}
                />
              )}
              {type === 'HIRE_TUTOR' && (
                <HireTutor
                  onBack={() => setStep(1)}
                  setOverlayOpen={setOverlayOpen}
                  hasProfileAddress={hasProfileAddress}
                  hasProfileContact={hasProfileContact}
                  setSuccess={setSuccess}
                  setLastError={setLastError}
                />
              )}
              {type === 'HIRE_QURAN' && (
                <HireQuran
                  onBack={() => setStep(1)}
                  setOverlayOpen={setOverlayOpen}
                  hasProfileAddress={hasProfileAddress}
                  hasProfileContact={hasProfileContact}
                  setSuccess={setSuccess}
                  setLastError={setLastError}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------- Center options -------------------- */

function CenterOption({
  title,
  desc,
  onClick,
  color,
}: {
  title: string
  desc: string
  onClick: () => void
  color: 'blue' | 'green' | 'purple'
}) {
  const map =
    {
      blue: 'from-blue-500/15 to-blue-500/5 border-blue-200 hover:shadow-blue-200',
      green: 'from-emerald-500/15 to-emerald-500/5 border-emerald-200 hover:shadow-emerald-200',
      purple: 'from-purple-500/15 to-purple-500/5 border-purple-200 hover:shadow-purple-200',
    }[color] || ''
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border bg-gradient-to-b p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-xl ${map}`}
    >
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </button>
  )
}

/* -------------------- Forms -------------------- */

function ProjectHelp({
  onBack,
  setOverlayOpen,
  hasProfileAddress,
  hasProfileContact,
  setSuccess,
  setLastError,
}: {
  onBack: () => void
  setOverlayOpen: (o: boolean) => void
  hasProfileAddress: boolean
  hasProfileContact: boolean
  setSuccess: (b: boolean) => void
  setLastError: (s: string | null) => void
}) {
  const { toast } = useToast()
  const [f, setF] = useState<any>({
    type: 'PROJECT_HELP',
    title: '',
    difficulty: '',
    level: '',
    language: 'Urdu',
    notes: '',
    budgetMin: '',
    budgetMax: '',
    currency: 'PKR',
    preferredTimeStart: '',
    preferredTimeEnd: '',
    mode: 'online',
    useProfileAddress: true,
    onsiteAddress: { countryCode: '', stateCode: '', cityName: '', zip: '', addressLine: '' },
    useProfileContact: true,
    contactName: '',
    contactPhone: '',
  })

  function onSubmit(e: any) {
    e.preventDefault()
    submitRequest(
      {
        type: f.type,
        title: f.title,
        description: `Difficulty: ${f.difficulty}; Level: ${f.level}`,
        preferredLanguage: f.language,
        notes: f.notes || undefined,
        budgetMin: f.budgetMin ? Number(f.budgetMin) : undefined,
        budgetMax: f.budgetMax ? Number(f.budgetMax) : undefined,
        currency: f.currency,
        preferredTimeStart: f.preferredTimeStart || undefined,
        preferredTimeEnd: f.preferredTimeEnd || undefined,
        mode: f.mode,
        onsiteAddress:
          f.mode === 'onsite'
            ? f.useProfileAddress && hasProfileAddress
              ? { useProfile: true }
              : { ...f.onsiteAddress }
            : undefined,
        contact:
          f.useProfileContact && hasProfileContact
            ? { useProfile: true }
            : f.contactPhone
            ? { name: f.contactName || undefined, phone: f.contactPhone }
            : undefined,
      },
      toast,
      setSuccess,
      setLastError,
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="rounded-xl border bg-primary/10 p-3 text-sm text-primary">
        Our qualified team will recommend the best suited option according to your personalized
        preferences and budget.
      </div>

      <div className="group">
        <Label>Assignment / Project Title</Label>
        <Input
          value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
          className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group">
          <Label>Difficulty level</Label>
          <Select onOpenChange={setOverlayOpen} value={f.difficulty} onValueChange={(v) => setF({ ...f, difficulty: v })}>
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              {['Easy', 'Moderate', 'Hard', 'Very Hard'].map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="group">
          <Label>Academic Level</Label>
          <Select onOpenChange={setOverlayOpen} value={f.level} onValueChange={(v) => setF({ ...f, level: v })}>
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue placeholder="Matric / Intermediate / Graduate / PhD" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              {['Matric', 'Intermediate', 'Graduate', 'PhD'].map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Budget f={f} setF={setF} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group">
          <Label>Start date</Label>
          <Input
            type="date"
            value={f.preferredTimeStart}
            onChange={(e) => setF({ ...f, preferredTimeStart: e.target.value })}
            className={`border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 ${
              f.preferredTimeStart && !isFutureOrToday(f.preferredTimeStart)
                ? 'border-red-500 focus-visible:border-red-600'
                : 'focus-visible:border-primary'
            }`}
          />
        </div>
        <div className="group">
          <Label>Completion date</Label>
          <Input
            type="date"
            value={f.preferredTimeEnd}
            onChange={(e) => setF({ ...f, preferredTimeEnd: e.target.value })}
            className={`border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 ${
              f.preferredTimeStart && f.preferredTimeEnd && !isAfter(f.preferredTimeEnd, f.preferredTimeStart)
                ? 'border-red-500 focus-visible:border-red-600'
                : 'focus-visible:border-primary'
            }`}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group">
          <Label>Preferred Language</Label>
          <Select onOpenChange={setOverlayOpen} value={f.language} onValueChange={(v) => setF({ ...f, language: v })}>
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              {['Urdu', 'English'].map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="group">
          <Label>Mode</Label>
          <Select onOpenChange={setOverlayOpen} value={f.mode} onValueChange={(v) => setF({ ...f, mode: v })}>
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {f.mode === 'onsite' && (
        <div className="grid gap-3 rounded-xl border p-4">
          {hasProfileAddress ? (
            <>
              <Label>Use profile address?</Label>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-1 ${f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                  onClick={() => setF({ ...f, useProfileAddress: true })}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-1 ${!f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                  onClick={() => setF({ ...f, useProfileAddress: false })}
                >
                  No, different
                </button>
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              No saved address found on your profile — please add address details:
            </span>
          )}
          {(!hasProfileAddress || !f.useProfileAddress) && (
            <AddressBlock value={f.onsiteAddress} onChange={(v) => setF({ ...f, onsiteAddress: v })} onOpenChange={setOverlayOpen} />
          )}
        </div>
      )}

      <div className="grid gap-3 rounded-xl border p-4">
        <Label>Use profile contact info?</Label>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
            onClick={() => setF({ ...f, useProfileContact: true })}
          >
            Yes
          </button>
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${!f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
            onClick={() => setF({ ...f, useProfileContact: false })}
          >
            No, provide contact
          </button>
        </div>
        {!f.useProfileContact && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="group">
              <Label>Contact Person Name</Label>
              <Input
                value={f.contactName}
                onChange={(e) => setF({ ...f, contactName: e.target.value })}
                className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
              />
            </div>
            <div className="group">
              <Label>Contact Number</Label>
              <Input
                value={f.contactPhone}
                onChange={(e) => setF({ ...f, contactPhone: e.target.value })}
                className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      <div className="group">
        <Label>Special Notes</Label>
        <Textarea
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
          placeholder="Any instructions…"
          className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
        />
      </div>

      <div className="mt-2 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}

function HireTutor({
  onBack,
  setOverlayOpen,
  hasProfileAddress,
  hasProfileContact,
  setSuccess,
  setLastError,
}: {
  onBack: () => void
  setOverlayOpen: (o: boolean) => void
  hasProfileAddress: boolean
  hasProfileContact: boolean
  setSuccess: (b: boolean) => void
  setLastError: (s: string | null) => void
}) {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<string[]>([])
  const [f, setF] = useState<any>({
    type: 'HIRE_TUTOR',
    stage: '',
    classLevel: '',
    language: 'Urdu',
    duration: 'Undecided',
    mode: 'online',
    budgetMin: '',
    budgetMax: '',
    currency: 'PKR',
    preferredTimeStart: '',
    useProfileAddress: true,
    onsiteAddress: { countryCode: '', stateCode: '', cityName: '', zip: '', addressLine: '' },
    useProfileContact: true,
    contactName: '',
    contactPhone: '',
  })

  function onSubmit(e: any) {
    e.preventDefault()
    submitRequest(
      {
        type: f.type,
        title: `Hire Tutor – ${f.stage || 'General'}`,
        description: `Class ${f.classLevel}; Subjects: ${subjects.join(', ')}`,
        classLevel: f.classLevel,
        subjects,
        preferredLanguage: f.language,
        duration: f.duration,
        mode: f.mode,
        budgetMin: f.budgetMin ? Number(f.budgetMin) : undefined,
        budgetMax: f.budgetMax ? Number(f.budgetMax) : undefined,
        currency: f.currency,
        preferredTimeStart: f.preferredTimeStart || undefined,
        onsiteAddress:
          f.mode === 'onsite'
            ? f.useProfileAddress && hasProfileAddress
              ? { useProfile: true }
              : { ...f.onsiteAddress }
            : undefined,
        contact:
          f.useProfileContact && hasProfileContact
            ? { useProfile: true }
            : f.contactPhone
            ? { name: f.contactName || undefined, phone: f.contactPhone }
            : undefined,
      },
      toast,
      setSuccess,
      setLastError,
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group">
          <Label>Education Stage</Label>
          <Select onOpenChange={setOverlayOpen} value={f.stage} onValueChange={(v) => setF({ ...f, stage: v })}>
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue placeholder="Toddler / School / College / University / O/A levels / Exam prep" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              {['Toddler', 'School', 'College', 'University', 'O/A levels', 'Exam preparation'].map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="group">
          <Label>Exact Class / Grade</Label>
          <Input
            value={f.classLevel}
            onChange={(e) => setF({ ...f, classLevel: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
      </div>

      <AutocompleteSubjects subjects={subjects} setSubjects={setSubjects} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group">
          <Label>Preferred Language</Label>
          <Select onOpenChange={setOverlayOpen} value={f.language} onValueChange={(v) => setF({ ...f, language: v })}>
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              {['Urdu', 'English'].map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="group">
          <Label>Mode</Label>
          <Select onOpenChange={setOverlayOpen} value={f.mode} onValueChange={(v) => setF({ ...f, mode: v })}>
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {f.mode === 'onsite' && (
        <div className="grid gap-3 rounded-xl border p-4">
          {hasProfileAddress ? (
            <>
              <Label>Use profile address?</Label>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-1 ${f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                  onClick={() => setF({ ...f, useProfileAddress: true })}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-1 ${!f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                  onClick={() => setF({ ...f, useProfileAddress: false })}
                >
                  No, different
                </button>
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              No saved address found on your profile — please add address details:
            </span>
          )}
          {(!hasProfileAddress || !f.useProfileAddress) && (
            <AddressBlock value={f.onsiteAddress} onChange={(v) => setF({ ...f, onsiteAddress: v })} onOpenChange={setOverlayOpen} />
          )}
        </div>
      )}

      <div className="grid gap-3 rounded-xl border p-4">
        <Label>Use profile contact info?</Label>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
            onClick={() => setF({ ...f, useProfileContact: true })}
          >
            Yes
          </button>
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${!f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
            onClick={() => setF({ ...f, useProfileContact: false })}
          >
            No, provide contact
          </button>
        </div>
        {!f.useProfileContact && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="group">
              <Label>Contact Person Name</Label>
              <Input
                value={f.contactName}
                onChange={(e) => setF({ ...f, contactName: e.target.value })}
                className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
              />
            </div>
            <div className="group">
              <Label>Contact Number</Label>
              <Input
                value={f.contactPhone}
                onChange={(e) => setF({ ...f, contactPhone: e.target.value })}
                className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group">
          <Label>Expected Start Date</Label>
          <Input
            type="date"
            value={f.preferredTimeStart}
            onChange={(e) => setF({ ...f, preferredTimeStart: e.target.value })}
            className={`border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 ${
              f.preferredTimeStart && !isFutureOrToday(f.preferredTimeStart)
                ? 'border-red-500 focus-visible:border-red-600'
                : 'focus-visible:border-primary'
            }`}
          />
        </div>
        <div className="group">
          <Label>Duration</Label>
          <Select onOpenChange={setOverlayOpen} value={f.duration} onValueChange={(v) => setF({ ...f, duration: v })}>
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              {['1 month', '2 months', '3 months', 'Undecided'].map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Budget f={f} setF={setF} />

      <div className="mt-2 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}

function HireQuran({
  onBack,
  setOverlayOpen,
  hasProfileAddress,
  hasProfileContact,
  setSuccess,
  setLastError,
}: {
  onBack: () => void
  setOverlayOpen: (o: boolean) => void
  hasProfileAddress: boolean
  hasProfileContact: boolean
  setSuccess: (b: boolean) => void
  setLastError: (s: string | null) => void
}) {
  const { toast } = useToast()
  const [f, setF] = useState<any>({
    type: 'HIRE_QURAN',
    proficiency: '',
    language: 'Urdu',
    duration: 'Undecided',
    preferredTimeStart: '',
    budgetMin: '',
    budgetMax: '',
    currency: 'PKR',
    mode: 'online',
    useProfileAddress: true,
    onsiteAddress: { countryCode: '', stateCode: '', cityName: '', zip: '', addressLine: '' },
    useProfileContact: true,
    contactName: '',
    contactPhone: '',
  })

  function onSubmit(e: any) {
    e.preventDefault()
    submitRequest(
      {
        type: f.type,
        title: `Hire Quran Tutor – ${f.proficiency || 'General'}`,
        description: `Quran Proficiency: ${f.proficiency}`,
        preferredLanguage: f.language,
        duration: f.duration,
        preferredTimeStart: f.preferredTimeStart || undefined,
        budgetMin: f.budgetMin ? Number(f.budgetMin) : undefined,
        budgetMax: f.budgetMax ? Number(f.budgetMax) : undefined,
        currency: f.currency,
        mode: f.mode,
        onsiteAddress:
          f.mode === 'onsite'
            ? f.useProfileAddress && hasProfileAddress
              ? { useProfile: true }
              : { ...f.onsiteAddress }
            : undefined,
        contact:
          f.useProfileContact && hasProfileContact
            ? { useProfile: true }
            : f.contactPhone
            ? { name: f.contactName || undefined, phone: f.contactPhone }
            : undefined,
      },
      toast,
      setSuccess,
      setLastError,
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group">
          <Label>Quran Proficiency</Label>
          <Select onOpenChange={setOverlayOpen} value={f.proficiency} onValueChange={(v) => setF({ ...f, proficiency: v })}>
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue placeholder="Basic (Qaida) / Tajweed / Tafseer / Hifz" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              {['Basic (Qaida)', 'Intermediate (Tajweed)', 'Tafseer', 'Hifz'].map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="group">
          <Label>Preferred Language</Label>
          <Select onOpenChange={setOverlayOpen} value={f.language} onValueChange={(v) => setF({ ...f, language: v })}>
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              {['Urdu', 'English'].map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="group">
          <Label>Start date</Label>
          <Input
            type="date"
            value={f.preferredTimeStart}
            onChange={(e) => setF({ ...f, preferredTimeStart: e.target.value })}
            className={`border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 ${
              f.preferredTimeStart && !isFutureOrToday(f.preferredTimeStart)
                ? 'border-red-500 focus-visible:border-red-600'
                : 'focus-visible:border-primary'
            }`}
          />
        </div>
        <div className="group">
          <Label>Duration</Label>
          <Select onOpenChange={setOverlayOpen} value={f.duration} onValueChange={(v) => setF({ ...f, duration: v })}>
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              {['1 month', '2 months', '3 months', 'Undecided'].map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="group">
        <Label>Mode</Label>
        <Select onOpenChange={setOverlayOpen} value={f.mode} onValueChange={(v) => setF({ ...f, mode: v })}>
          <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-50 bg-background shadow-lg">
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="onsite">On-site</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {f.mode === 'onsite' && (
        <div className="grid gap-3 rounded-xl border p-4">
          {hasProfileAddress ? (
            <>
              <Label>Use profile address?</Label>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-1 ${f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                  onClick={() => setF({ ...f, useProfileAddress: true })}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-1 ${!f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                  onClick={() => setF({ ...f, useProfileAddress: false })}
                >
                  No, different
                </button>
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              No saved address found on your profile — please add address details:
            </span>
          )}
          {(!hasProfileAddress || !f.useProfileAddress) && (
            <AddressBlock value={f.onsiteAddress} onChange={(v) => setF({ ...f, onsiteAddress: v })} onOpenChange={setOverlayOpen} />
          )}
        </div>
      )}

      <div className="grid gap-3 rounded-xl border p-4">
        <Label>Use profile contact info?</Label>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
            onClick={() => setF({ ...f, useProfileContact: true })}
          >
            Yes
          </button>
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${!f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
            onClick={() => setF({ ...f, useProfileContact: false })}
          >
            No, provide contact
          </button>
        </div>
        {!f.useProfileContact && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="group">
              <Label>Contact Person Name</Label>
              <Input
                value={f.contactName}
                onChange={(e) => setF({ ...f, contactName: e.target.value })}
                className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
              />
            </div>
            <div className="group">
              <Label>Contact Number</Label>
              <Input
                value={f.contactPhone}
                onChange={(e) => setF({ ...f, contactPhone: e.target.value })}
                className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      <Budget f={f} setF={setF} />

      <div className="mt-2 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}
