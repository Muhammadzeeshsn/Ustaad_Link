// app/api/notifications/route.ts
import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma } from "@/app/lib/prisma"

// Some projects name the model Notification/Notifications/UserNotification.
// Access the delegate defensively to avoid TS errors, without changing schema.
const notif = (prisma as any).notification
  ?? (prisma as any).notifications
  ?? (prisma as any).userNotification
  ?? (prisma as any).userNotifications

export async function GET(req: Request) {
  const c = cookies().get("ul_session")?.value
  if (!c) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const s = await verifySession(c)

  const url = new URL(req.url)
  const unreadOnly = url.searchParams.get("unread") === "1"

  const rows = await notif.findMany({
    where: { userId: s.uid, ...(unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return Response.json({ data: rows })
}

export async function POST(req: Request) {
  const c = cookies().get("ul_session")?.value
  if (!c) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const s = await verifySession(c)

  const { title, body } = await req.json().catch(() => ({ title: "Notification", body: null }))

  const created = await notif.create({
    data: {
      userId: s.uid,
      title: title || "Notification",
      body: body ?? null,
    },
  })

  return Response.json({ data: created })
}

export async function PATCH(req: Request) {
  const c = cookies().get("ul_session")?.value
  if (!c) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const s = await verifySession(c)

  const { id, read } = await req.json().catch(() => ({}))
  if (!id || typeof read !== "boolean") {
    return Response.json({ error: "id and read required" }, { status: 400 })
  }

  // Ensure the row belongs to the user (or admin)
  const row = await notif.findUnique({ where: { id } })
  if (!row) return Response.json({ error: "Not found" }, { status: 404 })
  if (row.userId !== s.uid && s.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const updated = await notif.update({ where: { id }, data: { read } })
  return Response.json({ data: updated })
}
