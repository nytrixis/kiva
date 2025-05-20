import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  // Extract orderId from the URL path
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const orderId = pathParts[pathParts.length - 1]; // last part is [orderId]

  const { searchParams } = url;
  const userId = searchParams.get("userId");

  if (!orderId || !userId) {
    return NextResponse.json(null, { status: 400 });
  }

  // Fetch the order with items and address
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items (
        *,
        product:product_id (
          *
        )
      ),
      address:address_id (
        *
      )
      `
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .single();

  if (error || !order) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(order);
}