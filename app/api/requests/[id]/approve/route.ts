import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma, $Enums } from "@/app/lib/prisma"
export async function POST(_:Request,{params}:{params:{id:string}}){
  const c=cookies().get("ul_session")?.value; if(!c) return Response.json({error:"Unauthorized"},{status:401})
  const s=await verifySession(c); if(s.role!=="admin") return Response.json({error:"Unauthorized"},{status:401})
const updated=await prisma.request.update({
    where: { id: params.id },
    data: { status: $Enums.RequestStatus.APPROVED },
  })
    return Response.json({ data: updated })
}
