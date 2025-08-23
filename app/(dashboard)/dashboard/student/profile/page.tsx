'use client'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Country, State, City } from 'country-state-city'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useToast } from '@/components/ui/use-toast'

type ProfileFormType = {
  fullName: string
  email: string
  contact: string
  contact2?: string
  educationLevel: string
  gender?: 'Male' | 'Female' | 'Other'
  institute?: string
  addressLine: string
  countryCode: string
  stateCode: string
  cityName: string
  zip?: string
  cnic?: string
  passport?: string
  notes?: string
  photoUrl?: string
  newPassword?: string
  confirmPassword?: string
}

const phoneRe = /^\+?[0-9\s\-()]{7,20}$/
const cnicRe = /^(?:\d{5}-\d{7}-\d|\d{13})$/
function mailto(subject: string, body: string) {
  return `mailto:admin@ustaadlink.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
function safeJson(r: Response) {
  const ct = r.headers.get('content-type') || ''
  if (!ct.includes('application/json')) return Promise.resolve(null)
  return r.text().then(t => (t ? JSON.parse(t) : null)).catch(() => null)
}

export default function EditStudent() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [avatar, setAvatar] = useState<{ file?: File; preview?: string }>({})
  const [countryCode, setCountryCode] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [lastError, setLastError] = useState<string | null>(null)

  const countries = useMemo(() => Country.getAllCountries().map(c => ({ name: c.name, code: c.isoCode })), [])
  const states = useMemo(() => countryCode ? State.getStatesOfCountry(countryCode).map(s => ({ name: s.name, code: s.isoCode })) : [], [countryCode])
  const cities = useMemo(() => (countryCode && stateCode) ? City.getCitiesOfState(countryCode, stateCode).map(c => ({ name: c.name })) : [], [countryCode, stateCode])

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<ProfileFormType>({
    defaultValues: { fullName:'', email:'', contact:'', contact2:'', educationLevel:'', gender: undefined, institute:'', addressLine:'', countryCode:'', stateCode:'', cityName:'', zip:'', cnic:'', passport:'', notes:'', photoUrl:'' },
    mode: 'onChange',
  })
  const err = (k: keyof ProfileFormType) => formState.errors[k]

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/students/me')
        const j = await safeJson(r)
        const d = (j as any)?.data || {}
        reset({
          fullName: d.name || '',
          email: d.email || '',
          contact: d.phone || '',
          contact2: d.phone2 || '',
          educationLevel: d.educationLevel || '',
          gender: d.gender || undefined,
          institute: d.institute || '',
          addressLine: d.addressLine || d.location || '',
          countryCode: d.countryCode || '',
          stateCode: d.stateCode || '',
          cityName: d.cityName || '',
          zip: d.zip || '',
          cnic: d.cnic || '',
          passport: d.passport || '',
          notes: d.notes || '',
          photoUrl: d.photoUrl || '',
        })
        if (d.countryCode) setCountryCode(d.countryCode)
        if (d.stateCode) setStateCode(d.stateCode)
        if (d.photoUrl) setAvatar({ preview: d.photoUrl })
      } catch (e: any) {
        setLastError(e?.message || 'Failed to load profile.')
        toast({ title: 'Error', description: 'Could not load profile.', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    })()
  }, [reset, toast])

  function onPickPhoto(file?: File) {
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatar({ file, preview: url })
  }
  function formatCNICInput(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits.length <= 5) return digits
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5, 12)}`
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`
  }

  async function onSubmit(v: ProfileFormType) {
    setLastError(null)
    // validations
    if (!v.fullName.trim()) return toast({ title: 'Full name required', variant: 'destructive' })
    if (!phoneRe.test(v.contact)) return toast({ title: 'Invalid contact number', variant: 'destructive' })
    if (v.contact2 && !phoneRe.test(v.contact2)) return toast({ title: 'Invalid 2nd contact', variant: 'destructive' })
    if (!v.educationLevel) return toast({ title: 'Select education level', variant: 'destructive' })
    if (!v.addressLine.trim()) return toast({ title: 'Enter address', variant: 'destructive' })
    if (!v.countryCode || !v.stateCode || !v.cityName) return toast({ title: 'Select country/state/city', variant: 'destructive' })
    if (v.cnic && !cnicRe.test(v.cnic)) return toast({ title: 'Invalid CNIC format', description: 'Use 12345-1234567-1 or 13 digits', variant: 'destructive' })

    try {
      setSaving(true)
      const r = await fetch('/api/students/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // email is read-only – not sent
        body: JSON.stringify({
          name: v.fullName,
          phone: v.contact,
          phone2: v.contact2 || undefined,
          educationLevel: v.educationLevel,
          gender: v.gender || undefined,
          institute: v.institute || undefined,
          addressLine: v.addressLine,
          location: v.addressLine,
          countryCode: v.countryCode,
          stateCode: v.stateCode,
          cityName: v.cityName,
          zip: v.zip || undefined,
          cnic: v.cnic || undefined,
          passport: v.passport || undefined,
          notes: v.notes || undefined,
          photoUrl: avatar.preview || v.photoUrl || undefined,
        }),
      })
      const j = await safeJson(r)
      if (!r.ok) throw new Error((j as any)?.error || 'Failed to save')

      toast({ title: 'Saved', description: 'Profile updated successfully.' })
    } catch (e: any) {
      setLastError(e?.message || 'Failed to save changes.')
      toast({ title: 'Error', description: e?.message || 'Failed to save changes.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    const newPassword = (watch('newPassword') || '').trim()
    const confirm = (watch('confirmPassword') || '').trim()
    if (!newPassword || newPassword.length < 8) return toast({ title: 'Weak password', description: 'Use at least 8 characters.', variant: 'destructive' })
    if (newPassword !== confirm) return toast({ title: 'Mismatch', description: 'Passwords do not match.', variant: 'destructive' })

    try {
      const r = await fetch('/api/reset-password', { // you already have /api/auth/reset-password; adjust if needed
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      const j = await safeJson(r)
      if (!r.ok) throw new Error((j as any)?.error || 'Failed to update password')
      toast({ title: 'Password updated' })
      setValue('newPassword', '')
      setValue('confirmPassword', '')
    } catch (e: any) {
      setLastError(e?.message || 'Failed to update password.')
      toast({ title: 'Error', description: e?.message || 'Failed to update password.', variant: 'destructive' })
    }
  }

  return (
    <div className="container max-w-3xl pb-16 pt-6">
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard/student">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Edit Profile</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* global dropdown overlay */}
      {overlayOpen && <div className="fixed inset-0 z-40 bg-background/90" />}

      {lastError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {lastError}{' '}
          <a
            href={mailto('Student Portal • Error report', `I faced this error on /dashboard/student/profile:\n\n${lastError}\n\nSteps to reproduce:`)}
            className="ml-2 inline-flex items-center rounded border border-red-300 bg-white px-2 py-0.5 text-xs hover:bg-red-100"
          >
            Report this to Admin
          </a>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-b from-primary/5 to-transparent">
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="text-muted-foreground">Loading profile…</div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 sm:gap-5 md:grid-cols-2">
              {/* Avatar */}
              <div className="md:col-span-2">
                <Label>Profile Photo (optional)</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl ring-2 ring-primary/40">
                    {avatar.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar.preview} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-muted text-xs text-muted-foreground">No photo</div>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickPhoto(e.target.files?.[0] || undefined)} />
                    Change Photo
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="fullName">Complete Name</Label>
                <Input id="fullName" {...register('fullName')} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
              </div>

              <div>
                <Label htmlFor="email">Email (read‑only)</Label>
                <Input id="email" type="email" {...register('email')} readOnly className="border-0 border-b bg-muted/30 text-foreground focus-visible:ring-0" />
              </div>

              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  {...register('contact', { pattern: { value: phoneRe, message: 'Invalid phone' } })}
                  className={`border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 ${err('contact') ? 'border-red-500 focus-visible:border-red-600' : 'focus-visible:border-primary'}`}
                  placeholder="+92 300 1234567"
                />
              </div>

              <div>
                <Label htmlFor="contact2">2nd Contact (optional)</Label>
                <Input
                  id="contact2"
                  {...register('contact2', { pattern: { value: phoneRe, message: 'Invalid phone' } })}
                  className={`border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 ${err('contact2') ? 'border-red-500 focus-visible:border-red-600' : 'focus-visible:border-primary'}`}
                />
              </div>

              <div>
                <Label>Education Level</Label>
                <Select onOpenChange={setOverlayOpen} value={watch('educationLevel')} onValueChange={(v) => setValue('educationLevel', v, { shouldValidate: true })}>
                  <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background shadow-lg">
                    {['Primary', 'Middle', 'Matric/Secondary', 'Intermediate', 'Undergraduate', 'Graduate', 'Postgraduate', 'Other'].map((x) => (
                      <SelectItem key={x} value={x}>
                        {x}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Gender</Label>
                <Select onOpenChange={setOverlayOpen} value={(watch('gender') as any) || ''} onValueChange={(v) => setValue('gender', v as any, { shouldValidate: true })}>
                  <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background shadow-lg">
                    {['Male', 'Female', 'Other'].map((x) => (
                      <SelectItem key={x} value={x}>
                        {x}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="institute">Current Institute (optional)</Label>
                <Input id="institute" {...register('institute')} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="addressLine">Complete Address</Label>
                <Textarea
                  id="addressLine"
                  rows={2}
                  {...register('addressLine')}
                  className={`border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 ${err('addressLine') ? 'border-red-500 focus-visible:border-red-600' : 'focus-visible:border-primary'}`}
                  placeholder="House, street, area"
                />
              </div>

              <div>
                <Label>Country</Label>
                <Select
                  onOpenChange={setOverlayOpen}
                  value={watch('countryCode') || ''}
                  onValueChange={(v) => {
                    setCountryCode(v)
                    setValue('countryCode', v, { shouldValidate: true })
                    setValue('stateCode', '')
                    setValue('cityName', '')
                    setStateCode('')
                  }}
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
                <Label>Province/State</Label>
                <Select
                  onOpenChange={setOverlayOpen}
                  value={watch('stateCode') || ''}
                  onValueChange={(v) => {
                    setStateCode(v)
                    setValue('stateCode', v, { shouldValidate: true })
                    setValue('cityName', '')
                  }}
                  disabled={!countryCode}
                >
                  <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
                    <SelectValue placeholder={countryCode ? 'Select province/state' : 'Select country first'} />
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

              <div>
                <Label>City</Label>
                <Select onOpenChange={setOverlayOpen} value={watch('cityName') || ''} onValueChange={(v) => setValue('cityName', v, { shouldValidate: true })} disabled={!stateCode}>
                  <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
                    <SelectValue placeholder={stateCode ? 'Select city' : 'Select state first'} />
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
                <Label htmlFor="zip">Postal/ZIP (optional)</Label>
                <Input id="zip" {...register('zip')} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
              </div>

              <div>
                <Label htmlFor="cnic">CNIC # (optional)</Label>
                <Input
                  id="cnic"
                  {...register('cnic')}
                  onChange={(e) => setValue('cnic', formatCNICInput(e.target.value), { shouldValidate: true })}
                  className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  placeholder="12345-1234567-1"
                />
              </div>

              <div>
                <Label htmlFor="passport">Passport # (optional)</Label>
                <Input id="passport" {...register('passport')} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" rows={2} {...register('notes')} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => history.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Update password */}
      <div id="update-password" className="mt-8">
        <Card>
          <CardHeader className="border-b bg-gradient-to-b from-primary/5 to-transparent">
            <CardTitle>Update Password</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 sm:p-6 md:grid-cols-2">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...register('newPassword')} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={updatePassword}>Update Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
