import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim().toLowerCase();
  const categoryParam = searchParams.get("category");
  const category =
    categoryParam === "skill" || categoryParam === "interest" ? categoryParam : null;

  if (!query || !category) {
    return NextResponse.json({ tags: [] });
  }

  try {
    const db = getDb();
    const snap = await db
      .collection("tags")
      .where("category", "==", category)
      .get();

    // Firestoreはilike検索をサポートしないため、クライアント側でフィルタリング
    const tags = snap.docs
      .map((doc) => doc.data().name as string)
      .filter((name) => name.toLowerCase().includes(query))
      .sort()
      .slice(0, 8);

    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json({ tags: [] }, { status: 500 });
  }
}
