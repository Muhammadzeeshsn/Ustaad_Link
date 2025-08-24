import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma } from "@/app/lib/db"
import { AssignmentStatus, RequestStatus } from "@prisma/client"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const c = cookies().get("ul_session")?.value
  if (!c) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const s = await verifySession(c)
  if (s.role !== "tutor") return Response.json({ error: "Unauthorized" }, { status: 401 })

  const row = await prisma.assignment.update({
    where: { id: params.id },
    data: { status: AssignmentStatus.ACCEPTED }, // ✅ enum, not "accepted"
  })

  await prisma.request.update({
    where: { id: row.requestId },
    data: { status: RequestStatus.IN_PROGRESS }, // ✅ enum, not "in_progress"
  })

  return Response.json({ data: row })
}
