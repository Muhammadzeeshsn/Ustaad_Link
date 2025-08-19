import { NextResponse } from "next/server"
export async function POST(){
  const res = NextResponse.json({ data: { ok: true } })
  res.cookies.set("ul_session","",{httpOnly:true,sameSite:"lax",secure:true,path:"/",maxAge:0})
  return res
}
