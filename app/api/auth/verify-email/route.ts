import { prisma } from "@/app/lib/db"
import { consumeEmailToken } from "@/app/lib/tokens"
import { NextResponse } from "next/server"
export async function GET(req: Request){
  const url = new URL(req.url)
  const token = url.searchParams.get("token") || ""
  const userId = await consumeEmailToken(token, "verify")
  if (!userId) return NextResponse.redirect(`${process.env.SITE_URL}/auth?verify=failed`)
  await prisma.user.update({ where: { id: userId }, data: { status: "active" } })
  return NextResponse.redirect(`${process.env.SITE_URL}/auth?verify=ok`)
}
