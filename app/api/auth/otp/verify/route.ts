// app/api/auth/otp/verify/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@prisma/client";

function sha(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

type RoleUpper = "STUDENT" | "TUTOR" | "ADMIN";
const toRole = (x?: string | null): RoleUpper =>
  (String(x).toUpperCase() as RoleUpper) === "TUTOR"
    ? "TUTOR"
    : (String(x).toUpperCase() as RoleUpper) === "ADMIN"
    ? "ADMIN"
    : "STUDENT";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();
    const reason = String(body.reason || "").trim();
    const challengeId = body.challengeId ? String(body.challengeId) : null;

    if (!email || !/^\d{6}$/.test(code) || !reason) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const now = new Date();
    const otp = await prisma.otpChallenge.findFirst({
      where: {
        email,
        reason,
        used: false,
        expiresAt: { gt: now },
        ...(challengeId ? { id: challengeId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json({ error: "OTP_NOT_FOUND_OR_EXPIRED" }, { status: 400 });
    }
    if (otp.codeHash !== sha(code)) {
      return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (reason === "register") {
        const payload = body.payload || {};
        const name: string = (payload.name ?? "").trim();
        const password: string = String(payload.password || "");
        const role: RoleUpper = toRole(payload.role);
        const phone: string = String(payload.phone || "").trim();

        if (!password || password.length < 6) {
          throw new Error("password_required");
        }
        if (phone && !phone.match(/^\+\d{1,3}\d{4,}$/)) {
          throw new Error("invalid_phone_format");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await tx.user.findFirst({
          where: { email, role },
          select: { id: true, role: true },
        });

        if (existingUser) {
          // Ensure email verified + active
          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              emailVerified: new Date(),
              status: "ACTIVE",
              name: name || null,
            },
          });

          // Upsert the appropriate profile so we don't error if it doesn't exist
          if (role === "STUDENT") {
            await tx.studentProfile.upsert({
              where: { userId: existingUser.id },
              update: { phone: phone || undefined, name: name || undefined },
              create: { userId: existingUser.id, phone: phone || null, name: name || null },
            });
          } else if (role === "TUTOR") {
            await tx.tutorProfile.upsert({
              where: { userId: existingUser.id },
              update: { phone: phone || undefined, /* keep optional fields as-is */ },
              create: {
                userId: existingUser.id,
                phone: phone || null,
                bio: null,
                subjects: null,
                experience: null,
                hourlyRate: null,
              },
            });
          }
        } else {
          // Fresh user + profile
          const user = await tx.user.create({
            data: {
              email,
              name: name || null,
              role,
              hashedPassword,
              status: "ACTIVE",
              emailVerified: new Date(),
              image: null,
              ...(role === "STUDENT"
                ? {
                    studentProfile: {
                      create: {
                        name: name || null,
                        phone: phone || null,
                      },
                    },
                  }
                : {
                    tutorProfile: {
                      create: {
                        name: name || null,
                        phone: phone || null,
                        bio: null,
                        subjects: null,
                        experience: null,
                        hourlyRate: null,
                      },
                    },
                  }),
            },
          });
          // nothing else needed here
        }
      }

      await tx.otpChallenge.update({
        where: { id: otp.id },
        data: { used: true },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[otp/verify] error:", e);
    const msg = String(e?.message || "");

    if (msg === "password_required") {
      return NextResponse.json({ error: "password_required" }, { status: 400 });
    }
    if (msg === "invalid_phone_format") {
      return NextResponse.json({ error: "invalid_phone_format" }, { status: 400 });
    }
    return NextResponse.json({ error: "server_error", details: e.message }, { status: 500 });
  }
}
