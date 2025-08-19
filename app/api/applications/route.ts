import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma } from "@/app/lib/db"
import { z } from "zod"
const Create=z.object({ requestId:z.string(), coverNote:z.string().optional(), proposedFee:z.number().int().optional(), schedule:z.string().optional() })
export async function POST(req:Request){
  const c=cookies().get("ul_session")?.value; if(!c) return Response.json({error:"Unauthorized"},{status:401})
  const s=await verifySession(c); if(s.role!=="tutor") return Response.json({error:"Unauthorized"},{status:401})
  const body=await req.json(); const data=Create.parse(body)
  const rq=await prisma.request.findUnique({ where:{ id:data.requestId } })
  if(!rq || rq.status!=="approved") return Response.json({error:"Request not open for applications"},{status:400})
  const created=await prisma.application.create({ data:{ requestId:data.requestId, tutorId:s.uid, coverNote:data.coverNote, proposedFee:data.proposedFee, schedule:data.schedule } })
  return Response.json({ data: created })
}
export async function GET(){
  const c=cookies().get("ul_session")?.value; if(!c) return Response.json({error:"Unauthorized"},{status:401})
  const s=await verifySession(c)
  if(s.role==="tutor"){ const rows=await prisma.application.findMany({ where:{ tutorId:s.uid }, orderBy:{ createdAt:"desc" } }); return Response.json({ data: rows }) }
  if(s.role==="admin"){ const rows=await prisma.application.findMany({ orderBy:{ createdAt:"desc" } }); return Response.json({ data: rows }) }
  return Response.json({ data: [] })
}
