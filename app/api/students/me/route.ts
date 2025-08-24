// app/api/students/me/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"

// Helper: map UI gender ("Male"|"Female"|"Other") -> Prisma enum ("MALE"|"FEMALE"|"OTHER")
function mapGender(g?: string | null) {
  if (!g) return null
  const up = String(g).toUpperCase()
  if (up.startsWith("M")) return "MALE"
  if (up.startsWith("F")) return "FEMALE"
  return "OTHER"
}

export async function GET() {
  try {
    const me = await requireUser()

    const [user, studentRaw] = await Promise.all([
      prisma.user.findUnique({
        where: { id: me.id },
        select: { email: true, name: true },
      }),
      // Keep broad shape so it works whether columns exist or not
      prisma.studentProfile.findUnique({
        where: { userId: me.id },
      }),
    ])

    const s = (studentRaw as any) || {}
    return NextResponse.json({
      ok: true,
      data: {
        email: user?.email ?? "",
        name: s.name ?? user?.name ?? "",
        phone: s.phone ?? "",
        phone2: s.phoneAlt ?? "",
        educationLevel: s.educationLevel ?? "",
        // If enum exists it might be "MALE"|"FEMALE"|"OTHER"
        gender: s.gender ?? null,
        institute: s.institute ?? "",
        addressLine: s.addressLine ?? s.location ?? "",
        countryCode: s.countryCode ?? "",
        stateCode: s.stateCode ?? "",
        cityName: s.cityName ?? "",
        zip: s.zip ?? "",
        cnic: s.cnicPassport ?? "",
        passport: "",
        notes: s.notes ?? "",
        photoUrl: s.image ?? "",
      },
    })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed to load profile." }, { status })
  }
}

export async function PUT(req: Request) {
  try {
    const me = await requireUser()
    const body = await req.json().catch(() => ({}))

    const data = {
      userId: me.id,
      name: body?.name ?? null,
      phone: body?.phone ?? null,
      phoneAlt: body?.phone2 ?? null,
      educationLevel: body?.educationLevel ?? null,
      gender: mapGender(body?.gender) ?? null,
      institute: body?.institute ?? null,
      addressLine: body?.addressLine ?? null,
      location: body?.location ?? body?.addressLine ?? null,
      countryCode: body?.countryCode ?? null,
      stateCode: body?.stateCode ?? null,
      cityName: body?.cityName ?? null,
      zip: body?.zip ?? null,
      cnicPassport: body?.cnic ?? null,
      notes: body?.notes ?? null,
      image: body?.photoUrl ?? null,
    }

    // Cast to any to avoid TS complaining about fields that may not exist in your current Prisma types
    const updated = await prisma.studentProfile.upsert({
      where: { userId: me.id },
      create: data as any,
      update: data as any,
      select: { userId: true },
    })

    return NextResponse.json({ ok: true, data: updated })
  } catch (e: any) {
    const msg = e?.message || "Failed to save profile."
    return NextResponse.json({ ok: false, error: msg }, { status: 400 })
  }
}
