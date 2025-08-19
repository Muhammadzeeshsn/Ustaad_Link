import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { title, details, category }
    // TODO: Save with your DB on the server (Prisma example below).
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 });
  }
}
