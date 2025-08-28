// app/(dashboard)/dashboard/student/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Country, State, City } from "country-state-city";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import ErrorDialog from "@/components/errors/ErrorDialog";
import ErrorReporter from "@/components/feedback/ErrorReporter";
import { PhoneInput } from "@/components/ui/phone-input";

type ProfileFormType = {
  fullName: string;
  email: string;
  contact: string;
  contact2?: string;
  educationLevel: string;
  gender?: "Male" | "Female" | "Other";
  institute?: string;
  addressLine: string;
  countryCode: string; // names
  stateCode: string;   // names
  cityName: string;    // names
  zip?: string;
  cnic?: string;
  notes?: string;
  photoUrl?: string;
  dob?: string; // yyyy-mm-dd

  newPassword?: string;
  confirmPassword?: string;
};

function safeJson(r: Response) {
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return Promise.resolve(null);
  return r.text().then((t) => (t ? JSON.parse(t) : null)).catch(() => null);
}

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function minAllowedDob() {
  // earliest allowed (adjust if needed)
  return "1900-01-01";
}
function maxAllowedDob() {
  // at least 7 years old
  const d = new Date();
  d.setFullYear(d.getFullYear() - 7);
  return ymd(d);
}

export default function EditStudent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<{ file?: File; preview?: string; uploaded?: boolean }>({});
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ISO helpers for dropdown sources; we still STORE NAMES
  const [isoCountry, setIsoCountry] = useState("");
  const [isoState, setIsoState] = useState("");

  const countries = useMemo(() => Country.getAllCountries().map((c) => ({ name: c.name, code: c.isoCode })), []);
  const states = useMemo(
    () => (isoCountry ? State.getStatesOfCountry(isoCountry).map((s) => ({ name: s.name, code: s.isoCode })) : []),
    [isoCountry]
  );
  const cities = useMemo(
    () => (isoCountry && isoState ? City.getCitiesOfState(isoCountry, isoState).map((c) => ({ name: c.name })) : []),
    [isoCountry, isoState]
  );

  const { register, handleSubmit, reset, setValue, watch } = useForm<ProfileFormType>({
    defaultValues: {
      fullName: "",
      email: "",
      contact: "",
      contact2: "",
      educationLevel: "",
      gender: undefined,
      institute: "",
      addressLine: "",
      countryCode: "",
      stateCode: "",
      cityName: "",
      zip: "",
      cnic: "",
      notes: "",
      photoUrl: "",
      dob: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/students/me");
        const j = (await safeJson(r)) as any;
        const d = j?.data || {};
        reset({
          fullName: d.name || "",
          email: d.email || "",
          contact: d.phone || "",
          contact2: d.phone2 || "",
          educationLevel: d.educationLevel || "",
          gender: d.gender
            ? String(d.gender).toUpperCase() === "MALE"
              ? "Male"
              : String(d.gender).toUpperCase() === "FEMALE"
              ? "Female"
              : "Other"
            : undefined,
          institute: d.institute || "",
          addressLine: d.addressLine || "",
          countryCode: d.countryCode || "",
          stateCode: d.stateCode || "",
          cityName: d.cityName || "",
          zip: d.zip || "",
          cnic: d.cnic || "",
          notes: d.notes || "",
          photoUrl: d.photoUrl || "",
          dob: d.dob ? ymd(new Date(d.dob)) : "",
        });

        if (d.countryCode) {
          const c = Country.getAllCountries().find((x) => x.name === d.countryCode);
          if (c) {
            setIsoCountry(c.isoCode);
            if (d.stateCode) {
              const s = State.getStatesOfCountry(c.isoCode).find((x) => x.name === d.stateCode);
              if (s) setIsoState(s.isoCode);
            }
          }
        }
        if (d.photoUrl) setAvatar({ preview: d.photoUrl, uploaded: true });
      } catch (e: any) {
        setErrorMsg(e?.message || "Failed to load profile.");
        setErrorOpen(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [reset]);

  function onPickPhoto(file?: File) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar({ file, preview: url, uploaded: false });
  }

  async function uploadAvatarIfNeeded(): Promise<string | undefined> {
    if (!avatar.file) return avatar.preview; // already URL or unchanged
    try {
      const fd = new FormData();
      fd.append("file", avatar.file);
      const r = await fetch("/api/uploads/avatar", { method: "POST", body: fd });
      const j = await safeJson(r);
      if (!r.ok) throw new Error((j as any)?.error || "Failed to upload avatar");
      const url = (j as any)?.url as string | undefined;
      setAvatar((a) => ({ ...a, uploaded: true, preview: url }));
      return url;
    } catch (e: any) {
      toast({ title: "Photo upload failed", description: e?.message || "Please try again.", variant: "destructive" });
      return undefined;
    }
  }

  async function onSubmit(v: ProfileFormType) {
    try {
      setSaving(true);

      // Validate DOB min age 7
      if (v.dob) {
        const dob = new Date(v.dob);
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 7);
        if (dob > minAgeDate) {
          toast({ title: "Invalid Date of Birth", description: "Minimum age is 7 years.", variant: "destructive" });
          setSaving(false);
          return;
        }
      }

      // Ensure avatar persisted if changed
      let photoUrl = avatar.preview || v.photoUrl || undefined;
      if (avatar.file && !avatar.uploaded) {
        const u = await uploadAvatarIfNeeded();
        if (u) photoUrl = u;
      }

      const r = await fetch("/api/students/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.fullName,
          phone: v.contact,
          phone2: v.contact2 || undefined,
          educationLevel: v.educationLevel,
          gender: v.gender || undefined,
          institute: v.institute || undefined,
          addressLine: v.addressLine,
          // store NAMES:
          countryCode: v.countryCode,
          stateCode: v.stateCode,
          cityName: v.cityName,
          zip: v.zip || undefined,
          cnic: v.cnic || undefined,
          notes: v.notes || undefined,
          photoUrl,
          dob: v.dob || undefined,
        }),
      });
      const j = await safeJson(r);
      if (!r.ok) throw new Error((j as any)?.error || "Failed to save changes.");
      toast({ title: "Saved", description: "Profile updated successfully." });
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to save changes.");
      setErrorOpen(true);
    } finally {
      setSaving(false);
    }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    const newPassword = (watch("newPassword") || "").trim();
    const confirm = (watch("confirmPassword") || "").trim();
    if (!newPassword || newPassword.length < 8)
      return toast({ title: "Weak password", description: "Use at least 8 characters.", variant: "destructive" });
    if (newPassword !== confirm)
      return toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });

    try {
      const r = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const j = await safeJson(r);
      if (!r.ok) throw new Error((j as any)?.error || "Failed to update password");
      toast({ title: "Password updated" });
      (document.getElementById("newPassword") as HTMLInputElement)?.blur();
      (document.getElementById("confirmPassword") as HTMLInputElement)?.blur();
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to update password.");
      setErrorOpen(true);
    }
  }

  return (
    <div className="container max-w-3xl pb-16 pt-6">
      <ErrorDialog
        open={errorOpen}
        title="Something went wrong"
        description={"We’re sorry — something unexpected happened. Please report it to our technical team so we can fix it quickly."}
        onOpenChange={setErrorOpen}
      >
        {/* hidden technical detail is errorMsg */}
        <ErrorReporter hiddenDetail={errorMsg || "Unknown error"} triggerText="Report to Technical Team" />
      </ErrorDialog>

      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/dashboard/student">Dashboard</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Edit Profile</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

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
                <Input id="fullName" {...register("fullName")} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
              </div>

              <div>
                <Label htmlFor="email">Email (read-only)</Label>
                <Input id="email" type="email" {...register("email")} readOnly className="border-0 border-b bg-muted/30 text-foreground focus-visible:ring-0" />
              </div>

              <div>
                <Label>Contact Number</Label>
                <PhoneInput
                  value={watch("contact")}
                  onChange={(p) => setValue("contact", p, { shouldValidate: true })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label>2nd Contact (optional)</Label>
                <PhoneInput
                  value={watch("contact2") || ""}
                  onChange={(p) => setValue("contact2", p, { shouldValidate: true })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Education Level</Label>
                <Select value={watch("educationLevel")} onValueChange={(v) => setValue("educationLevel", v, { shouldValidate: true })}>
                  <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background shadow-lg">
                    {["Primary","Middle","Matric/Secondary","Intermediate","Undergraduate","Graduate","Postgraduate","Other"].map((x) => (
                      <SelectItem key={x} value={x}>{x}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Gender</Label>
                <Select value={(watch("gender") as any) || ""} onValueChange={(v) => setValue("gender", v as any, { shouldValidate: true })}>
                  <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background shadow-lg">
                    {["Male", "Female", "Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* DOB */}
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  min={minAllowedDob()}
                  max={maxAllowedDob()}
                  value={watch("dob") || ""}
                  onChange={(e) => setValue("dob", e.target.value, { shouldValidate: true })}
                  className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">Minimum age: 7 years.</p>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="institute">Current Institute (optional)</Label>
                <Input id="institute" {...register("institute")} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="addressLine">Complete Address</Label>
                <Textarea id="addressLine" rows={2} {...register("addressLine")} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" placeholder="House, street, area" />
              </div>

              <div>
                <Label>Country</Label>
                <Select
                  value={watch("countryCode") || ""}
                  onValueChange={(name) => {
                    setValue("countryCode", name, { shouldValidate: true });
                    const c = Country.getAllCountries().find((x) => x.name === name);
                    setIsoCountry(c?.isoCode || "");
                    setIsoState("");
                    setValue("stateCode", "");
                    setValue("cityName", "");
                  }}
                >
                  <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="z-50 max-h-64 bg-background shadow-lg">
                    {countries.map((c) => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Province/State</Label>
                <Select
                  value={watch("stateCode") || ""}
                  onValueChange={(name) => {
                    setValue("stateCode", name, { shouldValidate: true });
                    const s = states.find((x) => x.name === name);
                    setIsoState(s?.code || "");
                    setValue("cityName", "");
                  }}
                  disabled={!isoCountry}
                >
                  <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
                    <SelectValue placeholder={isoCountry ? "Select province/state" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent className="z-50 max-h-64 bg-background shadow-lg">
                    {states.map((s) => <SelectItem key={s.code} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>City</Label>
                <Select
                  value={watch("cityName") || ""}
                  onValueChange={(v) => setValue("cityName", v, { shouldValidate: true })}
                  disabled={!isoState}
                >
                  <SelectTrigger className="h-10 border-0 border-b bg-transparent focus:ring-0">
                    <SelectValue placeholder={isoState ? "Select city" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent className="z-50 max-h-64 bg-background shadow-lg">
                    {cities.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="zip">Postal/ZIP (optional)</Label>
                <Input id="zip" {...register("zip")} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
              </div>

              <div>
                <Label htmlFor="cnic">National ID / Passport (optional)</Label>
                <Input id="cnic" {...register("cnic")} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Speciality / Notes (optional)</Label>
                <Textarea id="notes" rows={3} {...register("notes")} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" placeholder="Any special note, strengths or preferences…" />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
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
              <Input id="newPassword" type="password" {...register("newPassword")} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} className="border-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={updatePassword}>Update Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
