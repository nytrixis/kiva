import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  // Get all categories and their product counts
  const { data: categories, error } = await supabase
    .from("Category")
    .select("slug, id");

  if (error) {
    return NextResponse.json({}, { status: 500 });
  }

  // For each category, count products
  const counts: Record<string, number> = {};
  for (const cat of categories ?? []) {
    const { count } = await supabase
      .from("Product")
      .select("id", { count: "exact", head: true })
      .eq("categoryId", cat.id);
    counts[cat.slug] = count ?? 0;
  }

  return NextResponse.json(counts);
}