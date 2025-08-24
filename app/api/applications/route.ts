// app/api/applications/route.ts
import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma, $Enums } from "@/app/lib/prisma"
import { z } from "zod"

const Create = z.object({
  requestId: z.string(),
  coverNote: z.string().optional(),
  proposedFee: z.number().int().optional(),
  schedule: z.string().optional(),
})

export async function POST(req: Request) {
  const c = cookies().get("ul_session")?.value
  if (!c) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const s = await verifySession(c)
  if (s.role !== "tutor") return Response.json({ error: "Unauthorized" }, { status: 401 })

  const data = Create.parse(await req.json())

  const rq = await prisma.request.findUnique({ where: { id: data.requestId } })
  if (!rq || rq.status !== $Enums.RequestStatus.APPROVED) {
    return Response.json({ error: "Request not open for applications" }, { status: 400 })
  }

  // ---- Type-escape ONLY for fields your generated client doesn't see yet ----
  const created = await prisma.application.create({
    data: {
      requestId: data.requestId,
      tutorId: s.uid,
      proposedFee: data.proposedFee,
      schedule: data.schedule,
      ...(data.coverNote ? { coverNote: data.coverNote } : {}), // ok at runtime
    } as any, // <— temp escape until client matches schema
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
