import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;

  // Fetch product with category and seller
  const { data: product, error } = await supabase
    .from("Product")
    .select(`
      *,
      category:categoryId (
        id,
        name,
        slug
      ),
      seller:sellerId (
        id,
        name
      )
    `)
    .eq("id", id)
    .single();

  // Log error and product for debugging
  if (error) {
    console.error("Supabase error:", error);
  }
  console.log("Supabase product result:", product);

  if (error || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // 2. Fetch seller profile (only if product exists)
  const { data: sellerProfile } = await supabase
    .from("SellerProfile")
    .select("businessName, status")
    .eq("userId", product.sellerId)
    .single();

  return NextResponse.json({
  ...product,
  seller: {
    ...product.seller,
    sellerProfile: sellerProfile || null,
  },
});
}