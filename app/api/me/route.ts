import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma } from "@/app/lib/db"
export async function GET(){
  const c = cookies().get("ul_session")?.value
  if (!c) return Response.json({ data: null })
  try{
    const s = await verifySession(c)
    const user = await prisma.user.findUnique({ where: { id: s.uid }, select: { id:true, email:true, role:true, status:true } })
    return Response.json({ data: { user } })
  }catch{ return Response.json({ data: null })}
}
