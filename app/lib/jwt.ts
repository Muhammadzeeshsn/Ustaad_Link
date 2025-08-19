import { SignJWT, jwtVerify } from "jose"
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev")
export type SessionPayload = { uid: string; role: "admin"|"student"|"tutor" }
export async function signSession(p: SessionPayload){
  return await new SignJWT(p).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret)
}
export async function verifySession(t: string){ const { payload } = await jwtVerify(t, secret); return payload as any }
