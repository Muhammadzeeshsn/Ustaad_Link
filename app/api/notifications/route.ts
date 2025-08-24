// app/api/notifications/route.ts
import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma } from "@/app/lib/prisma"

export async function GET(req: Request) {
  const c = cookies().get("ul_session")?.value
  if (!c) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const s = await verifySession(c)

  const url = new URL(req.url)
  const unreadOnly = url.searchParams.get("unread") === "1"

  const rows = await (prisma as any).notification.findMany({
    where: { userId: s.uid, ...(unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: "desc" },
  })

  return Response.json({ data: rows })
}

export async function POST(req: Request) {
  const c = cookies().get("ul_session")?.value
  if (!c) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const s = await verifySession(c)

  const { title, body } = await req.json().catch(() => ({ title: "Notification", body: null }))

  const created = await (prisma as any).notification.create({
    data: {
      userId: s.uid,
      title: title || "Notification",
      body: body ?? null,
    },
  })

  return Response.json({ data: created })
}
