// app/api/assignments/[id]/accept/route.ts

import { cookies } from "next/headers";
import { verifySession } from "@/app/lib/jwt";
import { prisma, $Enums } from "@/app/lib/prisma";


export async function POST(_: Request, { params }: { params: { id: string } }) {
  const c = cookies().get("ul_session")?.value;
  if (!c) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const s = await verifySession(c);
  if (s.role !== "tutor")
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const row = await prisma.assignment.update({
    where: { id: params.id },
    data: { status: $Enums.AssignmentStatus.ACCEPTED }, // << enum
  });

  await prisma.request.update({
    where: { id: row.requestId },
    data: { status: $Enums.RequestStatus.ASSIGNED }, // << enum
  });

  return Response.json({ data: row });
}
