// app/api/applications/route.ts
import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma } from "@/app/lib/prisma"
import { z } from "zod"

const Create = z.object({
  requestId: z.string(),
  // Any extra keys from the client are ignored on purpose.
})

const OPEN_STATUSES = new Set([
  "OPEN",
  "APPROVED",
  "PENDING_REVIEW",
] as const)

export async function POST(req: Request) {
  const c = cookies().get("ul_session")?.value
  if (!c) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const s = await verifySession(c)
  if (s.role !== "tutor") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const data = Create.parse(body)

  const rq = await prisma.request.findUnique({ where: { id: data.requestId } })
  if (!rq || !OPEN_STATUSES.has(rq.status as any)) {
    return Response.json({ error: "Request not open for applications" }, { status: 400 })
  }

  // Only pass fields that certainly exist in your Prisma model.
  const created = await prisma.application.create({
    data: {
      requestId: data.requestId,
      tutorId: s.uid,
      // intentionally NOT sending proposedFee / coverNote / schedule
    },
  })

  return Response.json({ data: created })
}

export async function GET() {
  const c = cookies().get("ul_session")?.value
  if (!c) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const s = await verifySession(c)

  if (s.role === "tutor") {
    const rows = await prisma.application.findMany({
      where: { tutorId: s.uid },
      orderBy: { createdAt: "desc" },
    })
    return Response.json({ data: rows })
  }

  if (s.role === "admin") {
    const rows = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    })
    return Response.json({ data: rows })
  }

  return Response.json({ data: [] })
}
