// app/api/requests/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"
import { RequestType, Mode } from "@prisma/client"

// ---- Helpers ---------------------------------------------------------------

function asMode(v?: unknown): Mode | null {
  if (!v) return null
  const s = String(v).toUpperCase()
  return (["ONLINE", "ONSITE", "HYBRID"] as const).includes(s as Mode) ? (s as Mode) : null
}

// UI sends: "HIRE_TUTOR" | "HIRE_QURAN" | "PROJECT_HELP"
function mapUiTypeToSchema(v?: unknown): RequestType | null {
  if (!v) return null
  const s = String(v).toUpperCase()
  if (s === "PROJECT_HELP") return "PROJECT_HELP"
  if (s === "HIRE_QURAN")   return "QURAN"
  if (s === "HIRE_TUTOR")   return "OTHER"       // store specifics in `details`
  // (Optionally support legacy site values:)
  if (["SCHOOL", "COLLEGE", "UNIVERSITY", "QURAN", "OTHER", "PROJECT_HELP"].includes(s))
    return s as RequestType
  return null
}

function cleanInt(v: any): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

// ---- GET (student's own requests) -----------------------------------------
export async function GET() {
  try {
    const me = await requireUser()
    const rows = await prisma.request.findMany({
      where: { studentId: me.id },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ ok: true, data: rows })
  } catch (e: any) {
    const status = e?.status ?? 500
    return NextResponse.json({ ok: false, error: e?.message || "Unauthorized" }, { status })
  }
}

// ---- POST (create request) -------------------------------------------------
export async function POST(req: Request) {
  try {
    const me = await requireUser()
    const body = await req.json().catch(() => ({}))

    const title = String(body?.title || "").trim()
    if (!title) {
      return NextResponse.json({ ok: false, error: "Title is required." }, { status: 400 })
    }

    const schemaType = mapUiTypeToSchema(body?.type)
    if (!schemaType) {
      return NextResponse.json({ ok: false, error: "Invalid request type." }, { status: 400 })
    }

    // optional budget (Int?)
    const budgetMin = cleanInt(body?.budgetMin)
    const budgetMax = cleanInt(body?.budgetMax)

    // If UI says “use profile contact”, pull from StudentProfile (safe if missing)
    let contactName: string | null = body?.contactName ?? null
    let contactPhone: string | null = body?.contactPhone ?? null
    if (body?.useProfileContact) {
      const prof = await prisma.studentProfile.findUnique({ where: { userId: me.id } })
      if (prof) {
        contactName = contactName ?? (prof as any).name ?? null
        contactPhone = contactPhone ?? (prof as any).phone ?? null
      }
    }

    // Things that are not present as columns in Request → we serialize into `details`
    // (keeps the UI contract without breaking the schema)
    const detailsPayload = {
      uiType: String(body?.type || "").toUpperCase(), // e.g. HIRE_TUTOR
      subject: body?.subject ?? null,
      classLevel: body?.classLevel ?? null,
      preferredTime: body?.preferredTime ?? null,
      preferredTimeStart: body?.preferredTimeStart ?? null,
      preferredTimeEnd: body?.preferredTimeEnd ?? null,
      contactName,
      contactPhone,
      // include any other fields the form might send:
      location: body?.location ?? null,
      preferredLanguage: body?.preferredLanguage ?? null,
    }
    const details =
      Object.values(detailsPayload).every((v) => v == null)
        ? null
        : JSON.stringify(detailsPayload)

    const created = await prisma.request.create({
      data: {
        studentId: me.id,
        title,
        // your schema uses `details` (String?); there is **no** `description` column:
        details,
        type: schemaType,
        mode: asMode(body?.mode),

        budgetMin,
        budgetMax,
        // if you later add contactName/contactPhone columns, set them directly here.
      },
    })

    return NextResponse.json({ ok: true, data: created })
  } catch (e: any) {
    // Keep the user-facing message minimal
    return NextResponse.json({ ok: false, error: "Failed to create request." }, { status: 500 })
  }
}
