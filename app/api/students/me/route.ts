// app/api/students/me/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/lib/auth";
import { Gender, Role } from "@prisma/client";

function phoneOk(v?: string | null) {
  if (!v) return true;
  return /^\+\d{1,3}\d{4,}$/.test(v);
}

async function getStudentUser() {
  const session = await auth();
  const sessUser = session?.user as any | null;

  let userId: string | undefined = sessUser?.id;
  let role: Role | undefined;

  if (userId) {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    userId = u?.id;
    role = u?.role;
  } else if (sessUser?.email) {
    const u = await prisma.user.findUnique({
      where: { email: sessUser.email.toLowerCase() },
      select: { id: true, role: true },
    });
    userId = u?.id;
    role = u?.role;
  }

  return { userId, role };
}

export async function GET() {
  const { userId, role } = await getStudentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== Role.STUDENT) {
    return NextResponse.json({ error: "Only students have this profile." }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      studentProfile: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sp = user.studentProfile;
  const data = {
    id: user.id,
    email: user.email,
    name: sp?.name ?? user.name ?? null,
    phone: sp?.phone ?? null,
    phone2: sp?.phoneAlt ?? null,
    educationLevel: sp?.educationLevel ?? null,
    gender: sp?.gender ?? null,
    institute: sp?.institute ?? null,
    addressLine: sp?.addressLine ?? null,
    // store FULL NAMES for these three:
    countryCode: sp?.countryCode ?? null,
    stateCode: sp?.stateCode ?? null,
    cityName: sp?.cityName ?? null,
    zip: sp?.zip ?? null,
    cnic: sp?.cnicPassport ?? null,
    notes: sp?.notes ?? null,
    photoUrl: sp?.image ?? null,
    dob: sp?.dob ?? null, // <-- added
  };

  return NextResponse.json({ ok: true, data });
}

export async function PUT(req: Request) {
  const { userId, role } = await getStudentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== Role.STUDENT) {
    return NextResponse.json({ error: "Only students can update this profile." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  const {
    name,
    phone,
    phone2,
    educationLevel,
    gender,
    institute,
    addressLine,
    countryCode,
    stateCode,
    cityName,
    zip,
    cnic,
    notes,
    photoUrl,
    dob, // yyyy-mm-dd
  } = body || {};

  if (!phoneOk(phone)) {
    return NextResponse.json({ error: "Invalid phone format" }, { status: 400 });
  }
  if (!phoneOk(phone2)) {
    return NextResponse.json({ error: "Invalid 2nd phone format" }, { status: 400 });
  }

  const genderEnum =
    gender === "Male" ? Gender.MALE :
    gender === "Female" ? Gender.FEMALE :
    gender === "Other" ? Gender.OTHER :
    null;

  const dobDate =
    typeof dob === "string" && dob.trim()
      ? new Date(dob)
      : null;

  // Guard against invalid date
  if (dobDate && isNaN(dobDate.getTime())) {
    return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 });
  }

  // Upsert StudentProfile — NO `location` field
  await prisma.studentProfile.upsert({
    where: { userId },
    create: {
      userId,
      name: name || null,
      phone: phone || null,
      phoneAlt: phone2 || null,
      educationLevel: educationLevel || null,
      gender: genderEnum ?? undefined,
      institute: institute || null,
      addressLine: addressLine || null,
      // save FULL NAMES:
      countryCode: countryCode || null,
      stateCode: stateCode || null,
      cityName: cityName || null,
      zip: zip || null,
      cnicPassport: cnic || null,
      notes: notes || null,
      image: photoUrl || null,
      dob: dobDate || null, // <-- added
    },
    update: {
      name: name || null,
      phone: phone || null,
      phoneAlt: phone2 || null,
      educationLevel: educationLevel || null,
      gender: genderEnum ?? undefined,
      institute: institute || null,
      addressLine: addressLine || null,
      countryCode: countryCode || null,
      stateCode: stateCode || null,
      cityName: cityName || null,
      zip: zip || null,
      cnicPassport: cnic || null,
      notes: notes || null,
      image: photoUrl || null,
      dob: dobDate || null, // <-- added
    },
    select: { userId: true },
  });

  // Reflect display name / image on the User row too
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || undefined,
      image: photoUrl || undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
