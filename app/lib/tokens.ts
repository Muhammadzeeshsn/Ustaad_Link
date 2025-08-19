import crypto from "crypto"
import { prisma } from "@/app/lib/db"
export async function createEmailToken(userId: string, type: "verify"|"reset"){
  const token = crypto.randomBytes(32).toString("hex")
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  await prisma.emailToken.create({ data: { userId, tokenHash, type, expiresAt: new Date(Date.now()+1000*60*60) } })
  return token
}
export async function consumeEmailToken(token: string, type: "verify"|"reset"){
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  const row = await prisma.emailToken.findFirst({ where: { tokenHash, type, expiresAt: { gt: new Date() } } })
  if (!row) return null
  await prisma.emailToken.delete({ where: { id: row.id } })
  return row.userId
}
