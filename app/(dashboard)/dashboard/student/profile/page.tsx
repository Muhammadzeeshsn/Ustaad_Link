'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Country, State, City } from 'country-state-city'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
import { useToast } from '@/components/ui/use-toast'

// Simple validators (no zod)
const isPhone = (v: string) => /^\+?[0-9\s\-()]{7,20}$/.test(v)
const isCNIC = (v: string) => /^(?:\d{5}-\d{7}-\d|\d{13})$/.test(v)

type ProfileFormType = {
  fullName: string
  email: string // read-only
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
  photo?: File | null
}

export default function EditStudent() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [countryCode, setCountryCode] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [hasProfileAddress, setHasProfileAddress] = useState(false)

  // Data for dropdowns
  const countries = useMemo(
    () => Country.getAllCountries().map((c) => ({ name: c.name, code: c.isoCode })),
    [],
  )
  const states = useMemo(
    () =>
      countryCode
        ? State.getStatesOfCountry(countryCode).map((s) => ({
            name: s.name,
            code: s.isoCode,
          }))
        : [],
    [countryCode],
  )
  const cities = useMemo(
    () =>
      countryCode && stateCode
        ? City.getCitiesOfState(countryCode, stateCode).map((c) => ({ name: c.name }))
        : [],
    [countryCode, stateCode],
  )

  const { register, handleSubmit, setValue, watch, reset } = useForm<ProfileFormType>({
    defaultValues: {
      fullName: '',
      email: '',
      contact: '',
      contact2: '',
      educationLevel: '',
      gender: undefined,
      institute: '',
      addressLine: '',
      countryCode: '',
      stateCode: '',
      cityName: '',
      zip: '',
      cnic: '',
      passport: '',
      notes: '',
      photo: null,
    },
    mode: 'onChange',
  })

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/students/me')
        const j = await r.json()
        const d = j.data || {}

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
        })
        setCountryCode(d.countryCode || '')
        setStateCode(d.stateCode || '')
        setHasProfileAddress(
          !!(d.addressLine || d.location) &&
            !!d.countryCode &&
            !!d.stateCode &&
            !!d.cityName,
        )
        if (d.photoUrl) setPreview(d.photoUrl)
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message || 'Failed to load profile.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [reset, toast])

  function onPickPhoto(file?: File) {
    if (!file) return
    setValue('photo', file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  function formatCNICInput(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits.length <= 5) return digits
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5, 12)}`
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`
  }

  async function onSubmit(values: ProfileFormType) {
    // Email is read-only -> skip email validation here.
    if (!values.fullName.trim())
      return toast({ title: 'Full name required', variant: 'destructive' })
    if (!isPhone(values.contact))
      return toast({ title: 'Invalid contact number', variant: 'destructive' })
    if (values.contact2 && !isPhone(values.contact2))
      return toast({
        title: 'Invalid 2nd contact number',
        variant: 'destructive',
      })
    if (!values.educationLevel)
      return toast({ title: 'Select education level', variant: 'destructive' })
    if (!values.addressLine.trim())
      return toast({ title: 'Enter address', variant: 'destructive' })
    if (!values.countryCode || !values.stateCode || !values.cityName)
      return toast({
        title: 'Select country/state/city',
        variant: 'destructive',
      })
    if (values.cnic && !isCNIC(values.cnic))
      return toast({
        title: 'Invalid CNIC format',
        description: 'Use 12345-1234567-1 or 13 digits',
        variant: 'destructive',
      })

    try {
      const r = await fetch('/api/students/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.fullName,
          phone: values.contact,
          phone2: values.contact2 || undefined,
          educationLevel: values.educationLevel,
          gender: values.gender || undefined,
          institute: values.institute || undefined,
          addressLine: values.addressLine,
          countryCode: values.countryCode,
          stateCode: values.stateCode,
          cityName: values.cityName,
          zip: values.zip || undefined,
          cnic: values.cnic || undefined,
          passport: values.passport || undefined,
          notes: values.notes || undefined,
        }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Failed to save')
      toast({ title: 'Saved', description: 'Profile updated successfully.' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  // ------------- UI -------------
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
              <BreadcrumbPage>Edit Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Solid backdrop overlay when any dropdown is open */}
      {overlayOpen && (
        <div className="fixed inset-0 z-40 bg-background/85 md:bg-background/70" />
      )}

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-muted-foreground">Loading profile…</div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              {/* Photo */}
              <div className="md:col-span-2">
                <Label>Profile Photo (optional)</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                    {preview ? (
                      <img
                        src={preview}
                        className="h-full w-full object-cover"
                        alt="preview"
                      />
                    ) : null}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onPickPhoto(e.target.files?.[0] || undefined)}
                    />
                    Upload
                  </label>
                </div>
              </div>

              {/* Inputs use underline style with subtle animation */}
              <div className="group">
                <Label htmlFor="fullName">Complete Name</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  placeholder="Your full name"
                />
              </div>

              <div className="group">
                <Label htmlFor="email">Email (read‑only)</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled
                  className="border-0 border-b bg-muted/40 text-muted-foreground focus-visible:ring-0"
                />
              </div>

              <div className="group">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  {...register('contact')}
                  className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  placeholder="e.g. +92 300 1234567"
                />
              </div>

              <div className="group">
                <Label htmlFor="contact2">2nd Contact (optional)</Label>
                <Input
                  id="contact2"
                  {...register('contact2')}
                  className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  placeholder="Alternative number"
                />
              </div>

              <div className="group">
                <Label htmlFor="educationLevel">Education Level</Label>
                <Select
                  onOpenChange={setOverlayOpen}
                  value={watch('educationLevel')}
                  onValueChange={(v) => setValue('educationLevel', v, { shouldValidate: true })}
                >
                  <SelectTrigger
                    id="educationLevel"
                    className="h-10 border-0 border-b bg-transparent focus:ring-0"
                  >
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background shadow-lg">
                    {[
                      'Primary',
                      'Middle',
                      'Matric/Secondary',
                      'Intermediate',
                      'Undergraduate',
                      'Graduate',
                      'Postgraduate',
                      'Other',
                    ].map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="group">
                <Label>Gender</Label>
                <Select
                  onOpenChange={setOverlayOpen}
                  value={watch('gender') as any}
                  onValueChange={(v) => setValue('gender', v as any, { shouldValidate: true })}
                >
                  <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background shadow-lg">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 group">
                <Label htmlFor="institute">Current Institute (optional)</Label>
                <Input
                  id="institute"
                  {...register('institute')}
                  className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  placeholder="School/College/University name"
                />
              </div>

              <div className="md:col-span-2 group">
                <Label htmlFor="addressLine">Complete Address</Label>
                <Textarea
                  id="addressLine"
                  rows={2}
                  {...register('addressLine')}
                  className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  placeholder="House, street, area"
                />
              </div>

              <div className="group">
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

              <div className="group">
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
                    <SelectValue
                      placeholder={countryCode ? 'Select province/state' : 'Select country first'}
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

              <div className="group">
                <Label>City</Label>
                <Select
                  onOpenChange={setOverlayOpen}
                  value={watch('cityName') || ''}
                  onValueChange={(v) => setValue('cityName', v, { shouldValidate: true })}
                  disabled={!stateCode}
                >
                  <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
                    <SelectValue
                      placeholder={stateCode ? 'Select city' : 'Select state first'}
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

              <div className="group">
                <Label htmlFor="zip">Postal/ZIP (optional)</Label>
                <Input
                  id="zip"
                  {...register('zip')}
                  className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  placeholder="e.g. 75500"
                />
              </div>

              <div className="group">
                <Label htmlFor="cnic">CNIC # (optional)</Label>
                <Input
                  id="cnic"
                  {...register('cnic')}
                  onChange={(e) =>
                    setValue('cnic', formatCNICInput(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                  className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  placeholder="12345-1234567-1"
                />
              </div>

              <div className="group">
                <Label htmlFor="passport">Passport # (optional)</Label>
                <Input
                  id="passport"
                  {...register('passport')}
                  className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  placeholder="Passport number"
                />
              </div>

              <div className="md:col-span-2 group">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  {...register('notes')}
                  className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                  placeholder="Any preferences or availability"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => history.back()}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
