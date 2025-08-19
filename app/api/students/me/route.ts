import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma } from "@/app/lib/db"
import { z } from "zod"
const Upd = z.object({ name:z.string().min(2), phone:z.string().optional(), location:z.string().optional() })
export async function GET(){
  const c=cookies().get("ul_session")?.value; if(!c) return Response.json({error:"Unauthorized"},{status:401})
  const s=await verifySession(c); if(s.role!=="student") return Response.json({error:"Unauthorized"},{status:401})
  const profile=await prisma.studentProfile.findUnique({ where:{ userId:s.uid } })
  return Response.json({ data: profile })
}
export async function PUT(req:Request){
  const c=cookies().get("ul_session")?.value; if(!c) return Response.json({error:"Unauthorized"},{status:401})
  const s=await verifySession(c); if(s.role!=="student") return Response.json({error:"Unauthorized"},{status:401})
  const body=await req.json(); const data=Upd.parse(body)
  const updated=await prisma.studentProfile.update({ where:{ userId:s.uid }, data })
  return Response.json({ data: updated })
}
