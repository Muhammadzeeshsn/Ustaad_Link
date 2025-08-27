// app/api/requests/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Mode, RequestStatus, RequestType } from "@/types/prisma";

/* ========= Types ========= */

type RequestRow = {
  id: string;
  title: string | null;
  description: string | null;
  type: string; // lowercased for UI
  status: string; // lowercased for UI
  createdAt: string;

  subject?: string | null;
  classLevel?: string | null;
  preferredTime?: string | null;
  mode?: string | null;

  budgetMin?: number | null;
  budgetMax?: number | null;
  currency?: string | null;

  contactName?: string | null;
  contactPhone?: string | null;
  addressLine?: string | null;
  countryCode?: string | null;
  stateCode?: string | null;
  cityName?: string | null;
  zip?: string | null;
  location?: string | null; // derived "City, State, Country"
};

type IncomingMode = "online" | "onsite" | "hybrid" | null | undefined;

type IncomingBody = {
  title?: string | null;
  description?: string | null;
  type: "HIRE_TUTOR" | "HIRE_QURAN" | "PROJECT_HELP";

  // learning fields
  subject?: string | null;
  level?: string | null; // no column
  schedule?: string | null; // -> preferredTimeStart
  startDate?: string | null; // no column
  deadline?: string | null; // -> preferredTimeEnd

  // money/mode
  budgetMin?: number | null;
  budgetMax?: number | null;
  currency?: string | null;
  mode?: IncomingMode;

  // contact + address (may come empty if useProfile is selected)
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;

  reqAddressLine?: string | null;
  reqCountryCode?: string | null;
  reqStateCode?: string | null;
  reqCityName?: string | null;
  reqZip?: string | null;

  // misc
  preferredLanguage?: string | null;

  // behavior flags
  useProfile?: boolean | null;

  // tech
  userId?: string | null; // optional override; usually not needed
};

/* ========= Utils ========= */

function normalizeModeToEnum(m: IncomingMode): Mode | null {
  if (!m) return null;
  const v = m.toLowerCase();
  if (v === "online") return Mode.ONLINE;
  if (v === "onsite") return Mode.ONSITE;
  if (v === "hybrid") return Mode.HYBRID;
  return null;
}

function enumToLowercase(e: string | null | undefined): string {
  return (e ?? "").toString().toLowerCase();
}

function mapDbToRequestRow(r: {
  id: string;
  title: string | null;
  description: string | null;
  type: RequestType;
  status: RequestStatus;
  createdAt: Date;

  subjects: string | null;
  preferredTimeStart: string | null;
  preferredTimeEnd: string | null;
  mode: Mode | null;

  budgetMin: number | null;
  budgetMax: number | null;
  currency: string | null;

  contactName: string | null;
  contactPhone: string | null;

  reqAddressLine: string | null;
  reqCountryCode: string | null;
  reqStateCode: string | null;
  reqCityName: string | null;
  reqZip: string | null;
}): RequestRow {
  const preferredTime =
    r.preferredTimeStart || r.preferredTimeEnd
      ? [r.preferredTimeStart, r.preferredTimeEnd].filter(Boolean).join(" – ")
      : null;

  const mode =
    r.mode === "ONLINE"
      ? "online"
      : r.mode === "ONSITE"
      ? "onsite"
      : r.mode === "HYBRID"
      ? "hybrid"
      : null;

  const location =
    [r.reqCityName, r.reqStateCode, r.reqCountryCode]
      .filter(Boolean)
      .join(", ") || null;

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    type: enumToLowercase(r.type),
    status: enumToLowercase(r.status),
    createdAt: r.createdAt.toISOString(),

    subject: r.subjects,
    classLevel: null,
    preferredTime,
    mode,

    budgetMin: r.budgetMin,
    budgetMax: r.budgetMax,
    currency: r.currency,

    contactName: r.contactName,
    contactPhone: r.contactPhone,

    addressLine: r.reqAddressLine,
    countryCode: r.reqCountryCode,
    stateCode: r.reqStateCode,
    cityName: r.reqCityName,
    zip: r.reqZip,
    location,
  };
}

function mergeProfileIntoPayload<T extends IncomingBody>(
  body: T,
  profile?: {
    name?: string | null;
    phone?: string | null;
    addressLine?: string | null;
    countryCode?: string | null;
    stateCode?: string | null;
    cityName?: string | null;
    zip?: string | null;
  }
) {
  if (!profile) return body;

  return {
    ...body,
    contactName: body.contactName ?? profile.name ?? null,
    contactPhone: body.contactPhone ?? profile.phone ?? null,
    reqAddressLine: body.reqAddressLine ?? profile.addressLine ?? null,
    reqCountryCode: body.reqCountryCode ?? profile.countryCode ?? null,
    reqStateCode: body.reqStateCode ?? profile.stateCode ?? null,
    reqCityName: body.reqCityName ?? profile.cityName ?? null,
    reqZip: body.reqZip ?? profile.zip ?? null,
  };
}

function requireOnsiteAddress(body: IncomingBody) {
  const missing: string[] = [];
  if (!body.reqCityName) missing.push("reqCityName");
  if (!body.reqCountryCode) missing.push("reqCountryCode");
  if (!body.reqAddressLine) missing.push("reqAddressLine");
  // state/zip are optional depending on your needs; add if required:
  // if (!body.reqStateCode) missing.push("reqStateCode");
  // if (!body.reqZip) missing.push("reqZip");
  if (!body.contactName) missing.push("contactName");
  if (!body.contactPhone) missing.push("contactPhone");
  return missing;
}

/* ========= Handlers ========= */

// GET /api/requests — student’s requests
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  try {
    const rows = await prisma.request.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        createdAt: true,

        subjects: true,
        preferredTimeStart: true,
        preferredTimeEnd: true,
        mode: true,

        budgetMin: true,
        budgetMax: true,
        currency: true,

        contactName: true,
        contactPhone: true,

        reqAddressLine: true,
        reqCountryCode: true,
        reqStateCode: true,
        reqCityName: true,
        reqZip: true,
      },
    });

    const result = rows.map(mapDbToRequestRow);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("GET /api/requests error:", err);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// POST /api/requests — create request (stores ALL fields; auto-fill from profile when needed)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionUserId = (session.user as { id: string }).id;
  const sessionEmail =
    (session.user as { email?: string | null }).email ?? null;

  try {
    let body = (await req.json()) as IncomingBody;

    if (!body?.type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    const modeEnum = normalizeModeToEnum(body.mode ?? null);
    const effectiveUserId = body.userId ?? sessionUserId;

    // Load student profile if requested OR if onsite and any field is missing
    let profileToMerge:
      | Parameters<typeof mergeProfileIntoPayload>[1]
      | undefined;
    const needsProfileMerge =
      Boolean(body.useProfile) ||
      (modeEnum === "ONSITE" &&
        (!body.contactName ||
          !body.contactPhone ||
          !body.reqAddressLine ||
          !body.reqCountryCode ||
          !body.reqCityName));

    if (needsProfileMerge) {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: effectiveUserId },
        select: {
          name: true,
          phone: true,
          addressLine: true,
          countryCode: true,
          stateCode: true,
          cityName: true,
          zip: true,
        },
      });
      profileToMerge = profile ?? undefined;
      body = mergeProfileIntoPayload(body, profileToMerge);
    }

    // Default contactEmail to session email if not provided
    if (!body.contactEmail && sessionEmail) {
      body.contactEmail = sessionEmail;
    }

    // Enforce address/contact for onsite
    if (modeEnum === "ONSITE") {
      const missing = requireOnsiteAddress(body);
      if (missing.length) {
        return NextResponse.json(
          {
            error: `Missing required fields for onsite request: ${missing.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
    }

    const created = await prisma.request.create({
      data: {
        studentId: effectiveUserId,

        // basics
        title: body.title ?? null,
        description: body.description ?? null,
        type: body.type as RequestType,
        status: "PENDING_REVIEW",

        // learning
        subjects: body.subject ?? null,

        // time window (map schedule/deadline if provided)
        preferredTimeStart: body.schedule ?? null,
        preferredTimeEnd: body.deadline ?? null,
        preferredLanguage: body.preferredLanguage ?? null,

        // money / mode
        budgetMin: body.budgetMin ?? null,
        budgetMax: body.budgetMax ?? null,
        currency: body.currency ?? null,
        mode: modeEnum,

        // contact
        contactName: body.contactName ?? null,
        contactPhone: body.contactPhone ?? null,
        contactEmail: body.contactEmail ?? null,

        // address
        reqAddressLine: body.reqAddressLine ?? null,
        reqCountryCode: body.reqCountryCode ?? null,
        reqStateCode: body.reqStateCode ?? null,
        reqCityName: body.reqCityName ?? null,
        reqZip: body.reqZip ?? null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        createdAt: true,

        subjects: true,
        preferredTimeStart: true,
        preferredTimeEnd: true,
        mode: true,

        budgetMin: true,
        budgetMax: true,
        currency: true,

        contactName: true,
        contactPhone: true,

        reqAddressLine: true,
        reqCountryCode: true,
        reqStateCode: true,
        reqCityName: true,
        reqZip: true,
      },
    });

    const result = mapDbToRequestRow(created);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/requests error:", err);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
