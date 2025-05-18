import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { productid, rating, reviewtext, userid } = await req.json();

  // Fetch product to get sellerId
  const { data: product } = await supabase
    .from("Product")
    .select("sellerId")
    .eq("id", productid)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.sellerId === userid) {
    return NextResponse.json(
      { error: "Sellers cannot review their own products" },
      { status: 403 }
    );
  }

  // Insert or update review (upsert)
  const { error } = await supabase.from("productreview").upsert([
    { productid, userid, rating, reviewtext },
  ]);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  // Optionally, get productId from query params
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  let query = supabase.from("productreview").select("id, rating, reviewtext, createdat, userid, User(name, image)").order("createdat", { ascending: false });

  if (productId) {
    query = query.eq("productid", productId);
  }

  const { data, error } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ reviews: data });
}