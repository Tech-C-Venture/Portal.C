import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zitadelId = searchParams.get("zitadelId");

  if (!zitadelId) {
    return NextResponse.json({ complete: true });
  }

  try {
    const db = getDb();
    const snap = await db
      .collection("members")
      .where("zitadel_id", "==", zitadelId)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ complete: false });
    }

    const data = snap.docs[0].data();
    return NextResponse.json({ complete: Boolean(data.onboarding_completed) });
  } catch {
    return NextResponse.json({ complete: true });
  }
}
