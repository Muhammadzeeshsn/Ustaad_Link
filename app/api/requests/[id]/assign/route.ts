import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma } from "@/app/lib/prisma"
import { RequestStatus } from "@/types/prisma"
export async function POST(req:Request,{params}:{params:{id:string}}){
  const c=cookies().get("ul_session")?.value; if(!c) return Response.json({error:"Unauthorized"},{status:401})
  const s=await verifySession(c); if(s.role!=="admin") return Response.json({error:"Unauthorized"},{status:401})
  const { tutorId } = await req.json()
const updated = await prisma.request.update({
    where: { id: params.id },
    data: {
      status: RequestStatus.ASSIGNED,
      assignments: {
        create: { tutorId },
      },
    },
  })
    return Response.json({ data: updated })
}
