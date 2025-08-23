'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Country, State, City } from 'country-state-city'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useToast } from '@/components/ui/use-toast'

// ---------- Shared bits ----------
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
  const map = {
    blue: 'from-blue-500/15 to-blue-500/5 border-blue-200 hover:shadow-blue-200',
    green:
      'from-emerald-500/15 to-emerald-500/5 border-emerald-200 hover:shadow-emerald-200',
    purple:
      'from-purple-500/15 to-purple-500/5 border-purple-200 hover:shadow-purple-200',
  }[color]
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

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>
}

function isFutureOrToday(d: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const t = new Date(d)
  t.setHours(0, 0, 0, 0)
  return t.getTime() >= today.getTime()
}
function isAfter(a: string, b: string) {
  return new Date(a).getTime() > new Date(b).getTime()
}

// Address block with overlay-friendly dropdowns
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
        ? State.getStatesOfCountry(value.countryCode).map((s) => ({
            name: s.name,
            code: s.isoCode,
          }))
        : [],
    [value.countryCode],
  )
  const cities = useMemo(
    () =>
      value.countryCode && value.stateCode
        ? City.getCitiesOfState(value.countryCode, value.stateCode).map((c) => ({
            name: c.name,
          }))
        : [],
    [value.countryCode, value.stateCode],
  )
  return (
    <div className="grid gap-4">
      <Row>
        <div>
          <Label>Country</Label>
          <Select
            onOpenChange={onOpenChange}
            value={value.countryCode || ''}
            onValueChange={(v) =>
              onChange({ ...value, countryCode: v, stateCode: '', cityName: '' })
            }
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
              <SelectValue
                placeholder={value.countryCode ? 'Select state' : 'Select country first'}
              />
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
      </Row>
      <Row>
        <div>
          <Label>City</Label>
          <Select
            onOpenChange={onOpenChange}
            value={value.cityName || ''}
            onValueChange={(v) => onChange({ ...value, cityName: v })}
            disabled={!value.stateCode}
          >
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue
                placeholder={value.stateCode ? 'Select city' : 'Select state first'}
              />
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
      </Row>
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

export default function NewReq() {
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2>(1)
  const [type, setType] = useState<'PROJECT_HELP' | 'HIRE_TUTOR' | 'HIRE_QURAN' | null>(null)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [hasProfileAddress, setHasProfileAddress] = useState(false)
  const [hasProfileContact, setHasProfileContact] = useState(false)

  // Determine whether profile has address/contact to decide "Use profile address/contact"
  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/students/me')
        const j = await r.json()
        const d = j.data || {}
        setHasProfileAddress(
          !!(d.addressLine || d.location) &&
            !!d.countryCode &&
            !!d.stateCode &&
            !!d.cityName,
        )
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

  async function submit(body: any) {
    // basic validations shared across types
    if (body.budgetMin && body.budgetMax && Number(body.budgetMax) < Number(body.budgetMin)) {
      return toast({
        title: 'Budget range error',
        description: 'Max budget must be greater than min budget.',
        variant: 'destructive',
      })
    }

    if (body.preferredTimeStart && !isFutureOrToday(body.preferredTimeStart)) {
      return toast({
        title: 'Invalid start date',
        description: 'Start date must be today or later.',
        variant: 'destructive',
      })
    }
    if (
      body.preferredTimeStart &&
      body.preferredTimeEnd &&
      !isAfter(body.preferredTimeEnd, body.preferredTimeStart)
    ) {
      return toast({
        title: 'Invalid completion date',
        description: 'Completion date must be after start date.',
        variant: 'destructive',
      })
    }

    const r = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const j = await r.json()
    if (!r.ok) {
      toast({
        title: 'Error',
        description: j.error || 'Failed to create request.',
        variant: 'destructive',
      })
      return
    }
    toast({ title: 'Request created' })
    location.href = '/dashboard/student'
  }

  return (
    <div className="container max-w-3xl pb-28 pt-6">
      {/* Breadcrumbs */}
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

      {/* Solid page overlay when any dropdown is open */}
      {overlayOpen && (
        <div className="fixed inset-0 z-40 bg-background/85 md:bg-background/70" />
      )}

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle>Post a Request</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {step === 1 && (
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
          )}

          {step === 2 && type === 'PROJECT_HELP' && (
            <ProjectHelpForm
              onBack={() => setStep(1)}
              onSubmit={submit}
              onAnySelectOpen={setOverlayOpen}
              hasProfileAddress={hasProfileAddress}
              hasProfileContact={hasProfileContact}
            />
          )}
          {step === 2 && type === 'HIRE_TUTOR' && (
            <HireTutorForm
              onBack={() => setStep(1)}
              onSubmit={submit}
              onAnySelectOpen={setOverlayOpen}
              hasProfileAddress={hasProfileAddress}
              hasProfileContact={hasProfileContact}
            />
          )}
          {step === 2 && type === 'HIRE_QURAN' && (
            <HireQuranForm
              onBack={() => setStep(1)}
              onSubmit={submit}
              onAnySelectOpen={setOverlayOpen}
              hasProfileAddress={hasProfileAddress}
              hasProfileContact={hasProfileContact}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ---------- PROJECT / ASSIGNMENT ----------
function ProjectHelpForm({
  onBack,
  onSubmit,
  onAnySelectOpen,
  hasProfileAddress,
  hasProfileContact,
}: {
  onBack: () => void
  onSubmit: (b: any) => void
  onAnySelectOpen: (o: boolean) => void
  hasProfileAddress: boolean
  hasProfileContact: boolean
}) {
  const [f, setF] = useState<any>({
    type: 'PROJECT_HELP',
    title: '',
    difficulty: '',
    level: '',
    budgetMin: '',
    budgetMax: '',
    preferredTimeStart: '',
    preferredTimeEnd: '',
    language: 'Urdu',
    notes: '',
    mode: 'online',
    useProfileAddress: true,
    onsiteAddress: { countryCode: '', stateCode: '', cityName: '', zip: '', addressLine: '' },

    useProfileContact: true,
    contactName: '',
    contactPhone: '',
  })

  function submit(e: any) {
    e.preventDefault()
    onSubmit({
      type: f.type,
      title: f.title,
      description: `Difficulty: ${f.difficulty}; Level: ${f.level}`,
      budgetMin: f.budgetMin ? Number(f.budgetMin) : undefined,
      budgetMax: f.budgetMax ? Number(f.budgetMax) : undefined,
      preferredLanguage: f.language,
      preferredTimeStart: f.preferredTimeStart || undefined,
      preferredTimeEnd: f.preferredTimeEnd || undefined,
      notes: f.notes || undefined,
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
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <div className="rounded-xl border bg-muted/20 p-3 text-sm">
        Our qualified team will recommend the best suited option according to your
        personalized preferences and budget.
      </div>

      <div className="group">
        <Label>Assignment / Project Title</Label>
        <Input
          value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
          className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
        />
      </div>

      <Row>
        <div className="group">
          <Label>Difficulty level</Label>
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.difficulty}
            onValueChange={(v) => setF({ ...f, difficulty: v })}
          >
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
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.level}
            onValueChange={(v) => setF({ ...f, level: v })}
          >
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
      </Row>

      <Row>
        <div className="group">
          <Label>Budget Min (PKR)</Label>
          <Input
            value={f.budgetMin}
            onChange={(e) => setF({ ...f, budgetMin: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
        <div className="group">
          <Label>Budget Max (PKR)</Label>
          <Input
            value={f.budgetMax}
            onChange={(e) => setF({ ...f, budgetMax: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
      </Row>

      <Row>
        <div className="group">
          <Label>Start date</Label>
          <Input
            type="date"
            value={f.preferredTimeStart}
            onChange={(e) => setF({ ...f, preferredTimeStart: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
        <div className="group">
          <Label>Completion date</Label>
          <Input
            type="date"
            value={f.preferredTimeEnd}
            onChange={(e) => setF({ ...f, preferredTimeEnd: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
      </Row>

      <Row>
        <div className="group">
          <Label>Preferred Language</Label>
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.language}
            onValueChange={(v) => setF({ ...f, language: v })}
          >
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
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.mode}
            onValueChange={(v) => setF({ ...f, mode: v })}
          >
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Row>

      {f.mode === 'onsite' && (
        <div className="grid gap-3 rounded-xl border p-4">
          {/** only show "use profile address?" if profile has address **/}
          {hasProfileAddress ? (
            <>
              <Label>Use profile address?</Label>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-1 ${
                    f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => setF({ ...f, useProfileAddress: true })}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-1 ${
                    !f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => setF({ ...f, useProfileAddress: false })}
                >
                  No, add different address
                </button>
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              No saved address found on your profile — please add address details:
            </span>
          )}
          {(!hasProfileAddress || !f.useProfileAddress) && (
            <AddressBlock
              value={f.onsiteAddress}
              onChange={(v) => setF({ ...f, onsiteAddress: v })}
              onOpenChange={onAnySelectOpen}
            />
          )}
        </div>
      )}

      {/* Contact info choose */}
      <div className="grid gap-3 rounded-xl border p-4">
        <Label>Use profile contact info?</Label>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${
              f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
            }`}
            onClick={() => setF({ ...f, useProfileContact: true })}
            disabled={!hasProfileContact}
            title={!hasProfileContact ? 'No contact in profile; please enter below' : undefined}
          >
            Yes
          </button>
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${
              !f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
            }`}
            onClick={() => setF({ ...f, useProfileContact: false })}
          >
            No, provide contact
          </button>
        </div>
        {!f.useProfileContact && (
          <Row>
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
          </Row>
        )}
      </div>

      <div className="group">
        <Label>Special Notes</Label>
        <Textarea
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
          placeholder="Any instructions..."
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

// ---------- HIRE TUTOR ----------
function HireTutorForm({
  onBack,
  onSubmit,
  onAnySelectOpen,
  hasProfileAddress,
  hasProfileContact,
}: {
  onBack: () => void
  onSubmit: (b: any) => void
  onAnySelectOpen: (o: boolean) => void
  hasProfileAddress: boolean
  hasProfileContact: boolean
}) {
  const [subjectInput, setSubjectInput] = useState('')
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
    preferredTimeStart: '',

    useProfileAddress: true,
    onsiteAddress: { countryCode: '', stateCode: '', cityName: '', zip: '', addressLine: '' },

    useProfileContact: true,
    contactName: '',
    contactPhone: '',
  })

  function addSubject() {
    const v = subjectInput.trim()
    if (!v) return
    if (!subjects.includes(v)) setSubjects([...subjects, v])
    setSubjectInput('')
  }
  function removeSubject(s: string) {
    setSubjects(subjects.filter((x) => x !== s))
  }

  function submit(e: any) {
    e.preventDefault()
    onSubmit({
      type: f.type,
      title: `Hire Tutor – ${f.stage || 'General'}`,
      description: `Class ${f.classLevel}; Subjects: ${subjects.join(', ')}`,
      classLevel: f.classLevel,
      preferredLanguage: f.language,
      duration: f.duration,
      mode: f.mode,
      subjects,
      budgetMin: f.budgetMin ? Number(f.budgetMin) : undefined,
      budgetMax: f.budgetMax ? Number(f.budgetMax) : undefined,
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
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <Row>
        <div className="group">
          <Label>Education Stage</Label>
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.stage}
            onValueChange={(v) => setF({ ...f, stage: v })}
          >
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue placeholder="Toddler / School / College / University / O/A levels / Exam prep" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              {[
                'Toddler',
                'School',
                'College',
                'University',
                'O/A levels',
                'Exam preparation',
              ].map((x) => (
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
      </Row>

      <div>
        <Label>Subjects</Label>
        <div className="mt-1 flex gap-2">
          <Input
            placeholder="Type a subject and press Enter"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSubject()
              }
            }}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
          <Button type="button" onClick={addSubject}>
            Add
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {subjects.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs"
            >
              {s}{' '}
              <button
                type="button"
                className="opacity-60 hover:opacity-100"
                onClick={() => removeSubject(s)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      <Row>
        <div className="group">
          <Label>Preferred Language</Label>
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.language}
            onValueChange={(v) => setF({ ...f, language: v })}
          >
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
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.mode}
            onValueChange={(v) => setF({ ...f, mode: v })}
          >
            <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-lg">
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Row>

      {f.mode === 'onsite' && (
        <div className="grid gap-3 rounded-xl border p-4">
          {hasProfileAddress ? (
            <>
              <Label>Use profile address?</Label>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-1 ${
                    f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => setF({ ...f, useProfileAddress: true })}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`rounded-lg border px-3 py-1 ${
                    !f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
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
            <AddressBlock
              value={f.onsiteAddress}
              onChange={(v) => setF({ ...f, onsiteAddress: v })}
              onOpenChange={onAnySelectOpen}
            />
          )}
        </div>
      )}

      {/* Contact choose */}
      <div className="grid gap-3 rounded-xl border p-4">
        <Label>Use profile contact info?</Label>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${
              f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
            }`}
            onClick={() => setF({ ...f, useProfileContact: true })}
            // allow choosing yes even if missing; user will learn from admin follow-ups
          >
            Yes
          </button>
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${
              !f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
            }`}
            onClick={() => setF({ ...f, useProfileContact: false })}
          >
            No, provide contact
          </button>
        </div>
        {!f.useProfileContact && (
          <Row>
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
          </Row>
        )}
      </div>

      <Row>
        <div className="group">
          <Label>Expected Start Date</Label>
          <Input
            type="date"
            value={f.preferredTimeStart}
            onChange={(e) => setF({ ...f, preferredTimeStart: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
        <div className="group">
          <Label>Duration</Label>
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.duration}
            onValueChange={(v) => setF({ ...f, duration: v })}
          >
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
      </Row>

      <Row>
        <div className="group">
          <Label>Budget Min (PKR)</Label>
          <Input
            value={f.budgetMin}
            onChange={(e) => setF({ ...f, budgetMin: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
        <div className="group">
          <Label>Budget Max (PKR)</Label>
          <Input
            value={f.budgetMax}
            onChange={(e) => setF({ ...f, budgetMax: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
      </Row>

      <div className="mt-2 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}

// ---------- HIRE QURAN TUTOR ----------
function HireQuranForm({
  onBack,
  onSubmit,
  onAnySelectOpen,
  hasProfileAddress,
  hasProfileContact,
}: {
  onBack: () => void
  onSubmit: (b: any) => void
  onAnySelectOpen: (o: boolean) => void
  hasProfileAddress: boolean
  hasProfileContact: boolean
}) {
  const [f, setF] = useState<any>({
    type: 'HIRE_QURAN',
    proficiency: '',
    language: 'Urdu',
    duration: 'Undecided',
    preferredTimeStart: '',
    budgetMin: '',
    budgetMax: '',
    mode: 'online',

    useProfileAddress: true,
    onsiteAddress: { countryCode: '', stateCode: '', cityName: '', zip: '', addressLine: '' },

    useProfileContact: true,
    contactName: '',
    contactPhone: '',
  })

  function submit(e: any) {
    e.preventDefault()
    onSubmit({
      type: f.type,
      title: `Hire Quran Tutor – ${f.proficiency || 'General'}`,
      description: `Quran Proficiency: ${f.proficiency}`,
      preferredLanguage: f.language,
      duration: f.duration,
      preferredTimeStart: f.preferredTimeStart || undefined,
      budgetMin: f.budgetMin ? Number(f.budgetMin) : undefined,
      budgetMax: f.budgetMax ? Number(f.budgetMax) : undefined,
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
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <Row>
        <div className="group">
          <Label>Quran Proficiency</Label>
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.proficiency}
            onValueChange={(v) => setF({ ...f, proficiency: v })}
          >
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
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.language}
            onValueChange={(v) => setF({ ...f, language: v })}
          >
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
      </Row>

      <Row>
        <div className="group">
          <Label>Start date</Label>
          <Input
            type="date"
            value={f.preferredTimeStart}
            onChange={(e) => setF({ ...f, preferredTimeStart: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
        <div className="group">
          <Label>Duration</Label>
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.duration}
            onValueChange={(v) => setF({ ...f, duration: v })}
          >
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
      </Row>

      <Row>
        <div className="group">
          <Label>Mode</Label>
          <Select
            onOpenChange={onAnySelectOpen}
            value={f.mode}
            onValueChange={(v) => setF({ ...f, mode: v })}
          >
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
                    className={`rounded-lg border px-3 py-1 ${
                      f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setF({ ...f, useProfileAddress: true })}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`rounded-lg border px-3 py-1 ${
                      !f.useProfileAddress ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
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
              <AddressBlock
                value={f.onsiteAddress}
                onChange={(v) => setF({ ...f, onsiteAddress: v })}
                onOpenChange={onAnySelectOpen}
              />
            )}
          </div>
        )}
      </Row>

      {/* Contact choose */}
      <div className="grid gap-3 rounded-xl border p-4">
        <Label>Use profile contact info?</Label>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${
              f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
            }`}
            onClick={() => setF({ ...f, useProfileContact: true })}
          >
            Yes
          </button>
          <button
            type="button"
            className={`rounded-lg border px-3 py-1 ${
              !f.useProfileContact ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
            }`}
            onClick={() => setF({ ...f, useProfileContact: false })}
          >
            No, provide contact
          </button>
        </div>
        {!f.useProfileContact && (
          <Row>
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
          </Row>
        )}
      </div>

      <Row>
        <div className="group">
          <Label>Budget Min (PKR)</Label>
          <Input
            value={f.budgetMin}
            onChange={(e) => setF({ ...f, budgetMin: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
        <div className="group">
          <Label>Budget Max (PKR)</Label>
          <Input
            value={f.budgetMax}
            onChange={(e) => setF({ ...f, budgetMax: e.target.value })}
            className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
          />
        </div>
      </Row>

      <div className="mt-2 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}
