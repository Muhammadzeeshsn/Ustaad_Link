// app/api/requests/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Mode, RequestStatus, RequestType } from "@prisma/client";
import { format, toZonedTime } from "date-fns-tz";

/* ========= Types from client ========= */

type IncomingMode = "online" | "onsite" | "hybrid" | null | undefined;
type SubjectsIn = string | string[] | null | undefined;

type IncomingBody = {
  title?: string | null;
  description?: string | null;
  type: "HIRE_TUTOR" | "HIRE_QURAN" | "PROJECT_HELP";

  // learning fields
  subject?: SubjectsIn;
  level?: string | null;
  schedule?: string | null;
  startDate?: string | null;
  deadline?: string | null;

  // money/mode
  budgetMin?: number | null;
  budgetMax?: number | null;
  currency?: string | null;
  mode?: IncomingMode;

  // nested variant
  contact?: {
    useProfile?: boolean;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;

  onsiteAddress?: {
    useProfile?: boolean;
    addressLine?: string | null;
    countryCode?: string | null;
    stateCode?: string | null;
    cityName?: string | null;
    zip?: string | null;
  } | null;

  // optional override; usually not needed
  userId?: string | null;
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

function subjectsToString(s: SubjectsIn): string | null {
  if (!s) return null;
  if (Array.isArray(s)) {
    const cleaned = s.map((x) => (x ?? "").toString().trim()).filter(Boolean);
    return cleaned.length ? cleaned.join(", ") : null;
  }
  const one = s.toString().trim();
  return one || null;
}

const PK_TZ = "Asia/Karachi";
function toPkIso(d: Date): string {
  const z = toZonedTime(d, PK_TZ);
  return format(z, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: PK_TZ });
}

/* ===== Map DB -> UI row ===== */

type RequestRow = {
  id: string;
  title: string | null;
  description: string | null;
  type: string;
  status: string;
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
  location?: string | null;
};

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
    r.mode === Mode.ONLINE ? "online"
    : r.mode === Mode.ONSITE ? "onsite"
    : r.mode === Mode.HYBRID ? "hybrid"
    : null;

  const location =
    [r.reqCityName, r.reqStateCode, r.reqCountryCode].filter(Boolean).join(", ") || null;

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    type: enumToLowercase(r.type),
    status: enumToLowercase(r.status),
    createdAt: toPkIso(r.createdAt),

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

/* ========= GET ========= */

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  try {
    const rows = await prisma.request.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, description: true, type: true, status: true, createdAt: true,
        subjects: true, preferredTimeStart: true, preferredTimeEnd: true, mode: true,
        budgetMin: true, budgetMax: true, currency: true,
        contactName: true, contactPhone: true,
        reqAddressLine: true, reqCountryCode: true, reqStateCode: true, reqCityName: true, reqZip: true,
      },
    });

    const result = rows.map(mapDbToRequestRow);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("GET /api/requests error:", err);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

/* ========= POST ========= */

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionUserId = (session.user as { id: string }).id;
  const sessionEmail = (session.user as { email?: string | null }).email ?? null;

  try {
    const body = (await req.json()) as IncomingBody;
    if (!body?.type) return NextResponse.json({ error: "type is required" }, { status: 400 });

    const modeEnum = normalizeModeToEnum(body.mode ?? null);
    const effectiveUserId = body.userId ?? sessionUserId;

    let profile:
      | { name: string | null; phone: string | null; addressLine: string | null; countryCode: string | null;
          stateCode: string | null; cityName: string | null; zip: string | null; }
      | null = null;

    async function getProfileOnce() {
      if (profile !== null) return profile;
      profile = await prisma.studentProfile.findUnique({
        where: { userId: effectiveUserId },
        select: { name: true, phone: true, addressLine: true, countryCode: true, stateCode: true, cityName: true, zip: true },
      });
      return profile;
    }

    /* ------- contact (use profile only if asked) ------- */
    let contactName: string | null = null;
    let contactPhone: string | null = null;
    let contactEmail: string | null = null;

    if (body.contact?.useProfile) {
      const p = await getProfileOnce();
      contactName = p?.name ?? null;
      contactPhone = p?.phone ?? null;
      contactEmail = sessionEmail;
    } else {
      contactName = body.contact?.name?.trim() || null;
      contactPhone = body.contact?.phone?.trim() || null;
      contactEmail = body.contact?.email?.trim() || sessionEmail;
    }

    /* ------- address for onsite (fetch from profile only if asked) ------- */
    let reqAddressLine: string | null = null;
    let reqCountryCode: string | null = null;
    let reqStateCode: string | null = null;
    let reqCityName: string | null = null;
    let reqZip: string | null = null;

    if (modeEnum === Mode.ONSITE) {
      if (body.onsiteAddress?.useProfile) {
        const p = await getProfileOnce();
        reqAddressLine = p?.addressLine ?? null;
        reqCountryCode = p?.countryCode ?? null;
        reqStateCode = p?.stateCode ?? null;
        reqCityName = p?.cityName ?? null;
        reqZip = p?.zip ?? null;
      } else {
        reqAddressLine = body.onsiteAddress?.addressLine?.trim() || null;
        reqCountryCode = body.onsiteAddress?.countryCode?.trim() || null;
        reqStateCode = body.onsiteAddress?.stateCode?.trim() || null;
        reqCityName = body.onsiteAddress?.cityName?.trim() || null;
        reqZip = body.onsiteAddress?.zip?.trim() || null;
      }

      const missing: string[] = [];
      if (!reqAddressLine) missing.push("reqAddressLine");
      if (!reqCountryCode) missing.push("reqCountryCode");
      if (!reqCityName) missing.push("reqCityName");
      if (!contactName) missing.push("contactName");
      if (!contactPhone) missing.push("contactPhone");
      if (missing.length) {
        return NextResponse.json(
          { error: `Missing required fields for onsite request: ${missing.join(", ")}` },
          { status: 400 }
        );
      }
    }

    /* ------- required set (per form) ------- */
    const subjectStr = subjectsToString(body.subject);

    const mustPairs: Array<[string, unknown]> = [
      ["title", body.title],
      ["description", body.description],
      ["mode", modeEnum],
      ["budgetMin", body.budgetMin],
      ["budgetMax", body.budgetMax],
      ["currency", body.currency],
      ["contactName", contactName],
      ["contactPhone", contactPhone],
    ];

    if (body.type === "HIRE_TUTOR" || body.type === "HIRE_QURAN") {
      mustPairs.push(["subject", subjectStr]);
    }

    const missingBasics = mustPairs
      .filter(([, v]) => v === null || v === undefined || (typeof v === "string" && !v.trim()))
      .map(([k]) => k);

    if (missingBasics.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingBasics.join(", ")}` },
        { status: 400 }
      );
    }

    /* ------- time fields ------- */
    const preferredTimeStart =
      body.type === "PROJECT_HELP"
        ? body.schedule || null
        : body.startDate || body.schedule || null;

    const preferredTimeEnd =
      body.type === "PROJECT_HELP" ? body.deadline || null : null;

    /* ------- persist ------- */
    const created = await prisma.request.create({
      data: {
        studentId: effectiveUserId,
        title: body.title ?? null,
        description: body.description ?? null,
        type: body.type as RequestType,
        status: RequestStatus.PENDING_REVIEW,

        subjects: subjectStr,

        preferredTimeStart,
        preferredTimeEnd,
        preferredLanguage: null,

        budgetMin: body.budgetMin ?? null,
        budgetMax: body.budgetMax ?? null,
        currency: body.currency ?? null,
        mode: modeEnum,

        contactName,
        contactPhone,
        contactEmail,

        reqAddressLine,
        reqCountryCode,
        reqStateCode,
        reqCityName,
        reqZip,
      },
      select: {
        id: true, title: true, description: true, type: true, status: true, createdAt: true,
        subjects: true, preferredTimeStart: true, preferredTimeEnd: true, mode: true,
        budgetMin: true, budgetMax: true, currency: true,
        contactName: true, contactPhone: true,
        reqAddressLine: true, reqCountryCode: true, reqStateCode: true, reqCityName: true, reqZip: true,
      },
    });

    return NextResponse.json(mapDbToRequestRow(created), { status: 201 });
  } catch (err) {
    console.error("POST /api/requests error:", err);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}
