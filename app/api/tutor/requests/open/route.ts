import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma } from "@/app/lib/db"
export async function GET(){
  const c=cookies().get("ul_session")?.value; if(!c) return Response.json({error:"Unauthorized"},{status:401})
  const s=await verifySession(c); if(s.role!=="tutor") return Response.json({error:"Unauthorized"},{status:401})
  const rows=await prisma.request.findMany({ where:{ status:"approved" }, orderBy:{ createdAt:"desc" } })
  return Response.json({ data: rows })
}
