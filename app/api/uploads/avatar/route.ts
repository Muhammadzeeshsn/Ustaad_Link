// app/api/uploads/avatar/route.ts
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/app/lib/prisma"

export const runtime = "nodejs" // ensure Node runtime (not Edge)

export async function POST(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email?.toLowerCase() || null
    if (!email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    // Resolve DB user id from email (session.user.id isn’t guaranteed)
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (!dbUser?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const form = await req.formData().catch(() => null)
    const file = form?.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 })
    }

    // Infer simple extension from mimetype
    const mime = (file.type || "").toLowerCase()
    const ext =
      mime.includes("jpeg") ? "jpg" :
      mime.includes("jpg")  ? "jpg" :
      mime.includes("png")  ? "png" :
      mime.includes("webp") ? "webp" :
      mime.includes("gif")  ? "gif" : "bin"

    const bytes = new Uint8Array(await file.arrayBuffer()) // TS-safe for writeFile

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars")
    await fs.mkdir(uploadsDir, { recursive: true })

    const filename = `${dbUser.id}_${randomUUID()}.${ext}`
    const fullPath = path.join(uploadsDir, filename)

    await fs.writeFile(fullPath, bytes, { flag: "wx" })

    // Public URL path
    const urlPath = `/uploads/avatars/${filename}`
    return NextResponse.json({ ok: true, url: urlPath })
  } catch (e: any) {
    console.error("[upload/avatar] error:", e?.message || e)
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 })
  }
}
