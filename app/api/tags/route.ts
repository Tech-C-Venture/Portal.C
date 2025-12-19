import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type TagNameRow = Pick<Database["public"]["Tables"]["tags"]["Row"], "name">;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  const categoryParam = searchParams.get("category");
  const category =
    categoryParam === "skill" || categoryParam === "interest" ? categoryParam : null;

  if (!query || !category) {
    return NextResponse.json({ tags: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("name")
    .eq("category", category)
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(8);

  if (error) {
    return NextResponse.json({ tags: [] }, { status: 500 });
  }

  const tags = ((data ?? []) as TagNameRow[]).map((row) => row.name);
  return NextResponse.json({ tags });
}
