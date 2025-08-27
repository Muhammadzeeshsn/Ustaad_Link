// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/types/prisma";
import bcrypt from "bcryptjs";

type Body = {
  email: string;
  password: string;
  role: Role; // "STUDENT" | "TUTOR" | "ADMIN"
};

async function touchThrottle(email: string, role: Role, failedAttempt: boolean) {
  const now = new Date();

  // No composite-unique used here; we look up by (email, role)
  const existing = await prisma.loginThrottle.findFirst({
    where: { email, role },
    select: { id: true },
  });

  if (!existing) {
    await prisma.loginThrottle.create({
      data: {
        email,
        role,
        count: failedAttempt ? 1 : 0,
        lastAttemptAt: now,
        // lockedUntil: null,
      },
    });
    return;
  }

  await prisma.loginThrottle.update({
    where: { id: existing.id },
    data: failedAttempt
      ? {
          count: { increment: 1 },
          lastAttemptAt: now,
        }
      : {
          lastAttemptAt: now,
        },
  });
}

export async function POST(req: Request) {
  try {
    const { email, password, role } = (await req.json()) as Body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "email, password and role are required" },
        { status: 400 }
      );
    }

    // Find the user by (email, role)
    const user = await prisma.user.findFirst({
      where: { email, role },
      select: { id: true, email: true, hashedPassword: true, role: true, status: true },
    });

    if (!user || !user.hashedPassword) {
      await touchThrottle(email, role, true);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.hashedPassword);
    if (!ok) {
      await touchThrottle(email, role, true);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Successful attempt — still update lastAttemptAt (don’t increment count)
    await touchThrottle(email, role, false);

    // If you want to set a session/cookie, that’s handled by NextAuth in your [...nextauth] route.
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
