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

        // Validate phone format if provided
        if (phone && !phone.match(/^\+\d{1,3}\d{4,}$/)) {
          throw new Error("invalid_phone_format");
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user already exists
        const existingUser = await tx.user.findFirst({
          where: { email, role },
        });

        if (existingUser) {
          // Update existing user
          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              emailVerified: new Date(),
              status: "ACTIVE",
              // Update phone in the appropriate profile
              ...(phone && role === "STUDENT" ? {
                studentProfile: {
                  update: {
                    phone: phone,
                  },
                },
              } : {}),
              ...(phone && role === "TUTOR" ? {
                tutorProfile: {
                  update: {
                    phone: phone,
                  },
                },
              } : {}),
            },
          });
        } else {
          // Create new user with the correct relation names
          const userData: Prisma.UserCreateInput = {
            email,
            name: name || null,
            role,
            hashedPassword,
            status: "ACTIVE",
            emailVerified: new Date(),
            image: null,
          };

          // Add profile creation based on role
          if (role === "STUDENT") {
            userData.studentProfile = {
              create: {
                name: name || null,
                phone: phone || null,
              },
            };
          } else if (role === "TUTOR") {
            userData.tutorProfile = {
              create: {
                name: name || null,
                phone: phone || null,
                bio: null,
                subjects: null,
                experience: null,
                hourlyRate: null,
              },
            };
          }

          await tx.user.create({
            data: userData,
          });
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