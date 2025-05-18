import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  req: NextRequest,
  context: { params: { productId: string } }
) {
  const { productId } = context.params;

  const { data, error } = await supabase
    .from("productreview")
    .select("id, rating, reviewtext, createdat, userid, User(name, image)")
    .eq("productid", productId)
    .order("createdat", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ reviews: data });
}