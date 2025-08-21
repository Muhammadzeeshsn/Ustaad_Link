import crypto from 'crypto'
import { prisma } from '@/app/lib/db'

export async function createEmailToken(userId: string, _type: 'verify' | 'reset') {
  // store the raw token (your schema uses `token`, not hash)
  const token = crypto.randomBytes(32).toString('hex')
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    },
  })
  return token
}

export async function consumeEmailToken(token: string, _type: 'verify' | 'reset') {
  const row = await prisma.emailVerificationToken.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
    },
  })
  if (!row) return null
  await prisma.emailVerificationToken.delete({ where: { id: row.id } })
  return row.userId
}
