import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  const category = searchParams.get("category") ?? "";

  if (!query || (category !== "skill" && category !== "interest")) {
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

  return NextResponse.json({ tags: data.map((row) => row.name) });
}
