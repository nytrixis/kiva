import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// Define RouteHandlerContext inline since it's not publicly exported by Next.js
type RouteHandlerContext = { params: { productId: string } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  req: NextRequest,
  context: RouteHandlerContext
) {
  const { productId } = context.params as { productId: string };

  const { data, error } = await supabase
    .from("productreview")
    .select("id, rating, reviewtext, createdat, userid, User(name, image)")
    .eq("productid", productId)
    .order("createdat", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ reviews: data });
}