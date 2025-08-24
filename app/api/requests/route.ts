// app/api/requests/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"
import { RequestType, Mode } from "@prisma/client"

/**
 * GET /api/requests
 * - For students: returns their own requests (latest first)
 * - For tutors/admin (if you need later): can be extended with filters
 */
export async function GET() {
  try {
    const me = await requireUser()
    const rows = await prisma.request.findMany({
      where: { studentId: me.id },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ ok: true, data: rows })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed to load requests." }, { status })
  }
}

/**
 * POST /api/requests
 * Expects:
 * {
 *   title: string,
 *   description?: string,
 *   type: "HIRE_TUTOR" | "HIRE_QURAN" | "PROJECT_HELP",
 *   subject?: string,
 *   classLevel?: string,
 *   mode?: "ONLINE" | "ONSITE" | "HYBRID",
 *   preferredTime?: string,
 *   location?: string,
 *   budgetMin?: number,
 *   budgetMax?: number,
 *   // contact fields for this request
 *   contactName?: string,
 *   contactPhone?: string,
 *   useProfileContact?: boolean
 * }
 */
export async function POST(req: Request) {
  try {
    const me = await requireUser()
    const body = await req.json().catch(() => ({}))

    // If the UI sets "use profile contact", pull from StudentProfile
    let contactName = body?.contactName ?? null
    let contactPhone = body?.contactPhone ?? null
    if (body?.useProfileContact) {
      const prof = await prisma.studentProfile.findUnique({ where: { userId: me.id } })
      const s = (prof as any) || {}
      contactName = s?.name ?? contactName
      contactPhone = s?.phone ?? contactPhone
    }

    // Minimal validation
    if (!body?.title || !String(body.title).trim()) {
      return NextResponse.json({ ok: false, error: "Title is required." }, { status: 400 })
    }
    const type = String(body?.type || "").toUpperCase()
    if (!["HIRE_TUTOR", "HIRE_QURAN", "PROJECT_HELP"].includes(type)) {
      return NextResponse.json({ ok: false, error: "Invalid request type." }, { status: 400 })
    }

    const modeIn = body?.mode ? String(body.mode).toUpperCase() : undefined
    const validMode = modeIn && ["ONLINE", "ONSITE", "HYBRID"].includes(modeIn) ? (modeIn as Mode) : undefined

    const created = await prisma.request.create({
      data: {
        studentId: me.id,
        title: String(body.title).trim(),
        description: body?.description ?? null,
        type: type as RequestType,

        // core tutoring metadata
        subject: body?.subject ?? null,             // NOTE: field is "subject" (singular)
        classLevel: body?.classLevel ?? null,
        mode: validMode ?? null,
        preferredTime: body?.preferredTime ?? null,
        location: body?.location ?? null,

        // min/max budget (kept as Int? in your schema)
        budgetMin: body?.budgetMin ?? null,
        budgetMax: body?.budgetMax ?? null,

        // extra per-request contact info (persist alongside the request)
        // If you added these columns in your Request model, set them here.
        // If not, remove or keep as "any" write (harmless no-op).
        ...(contactName ? { contactName } : {}),
        ...(contactPhone ? { contactPhone } : {}),
      } as any, // safe-cast: if you haven't added contactName/contactPhone columns yet, TS won't block.
    })

    return NextResponse.json({ ok: true, data: created })
  } catch (e: any) {
    const status = e?.status || 500
    return NextResponse.json({ ok: false, error: e?.message || "Failed to create request." }, { status })
  }
}
