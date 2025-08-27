import { cookies } from "next/headers"
import { verifySession } from "@/app/lib/jwt"
import { prisma, $Enums } from "@/app/lib/prisma"
export async function GET(){
  const c=cookies().get("ul_session")?.value; if(!c) return Response.json({error:"Unauthorized"},{status:401})
  const s=await verifySession(c); if(s.role!=="tutor") return Response.json({error:"Unauthorized"},{status:401})
const rows = await prisma.request.findMany({
    where: { status: $Enums.RequestStatus.APPROVED },
    orderBy: { createdAt: "desc" },
  })
    return Response.json({ data: rows })
}
