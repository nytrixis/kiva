import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const sellerId = req.nextUrl.searchParams.get("sellerId");

  if (!sellerId) {
    return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
  }

  const { data: products, error } = await supabase
    .from("Product")
    .select("id, name, images")
    .eq("sellerId", sellerId)
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(products || []);
}