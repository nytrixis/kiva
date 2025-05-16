import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  rating: number;
}

interface SellerUser {
  id: string;
  name: string;
  createdAt: string;
  products?: Product[];
}

interface Seller {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  description: string | null;
  phoneNumber: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  taxId: string | null;
  categories: string[];
  status: string;
  verifiedAt: string | null;
  identityDocument: string | null;
  businessDocument: string | null;
  logoImage: string | null;
  createdAt: string;
  updatedAt: string;
  user?: SellerUser;
  avgRating?: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoriesParam = searchParams.get("categories");
  const minRatingParam = searchParams.get("minRating");

  // Prepare filters
  let categories: string[] | undefined = undefined;
  if (categoriesParam) {
    categories = categoriesParam.split(",");
  }

  // Fetch seller profiles with user and products
  let query = supabase
    .from("SellerProfile")
    .select(`
      *,
      user:userId (
        id,
        name,
        products:Product (
          rating
        )
      )
    `)
    .eq("status", "APPROVED");

  // Filter by categories if provided (assuming a categories array column)
  if (categories && categories.length > 0) {
    // Use 'cs' (contains) for array columns, but must match exactly
    query = query.contains("categories", categories);
  }

  const { data: sellers, error } = await query;

  // Debug log
  console.log("Sellers:", sellers, "Error:", error);

  if (error) {
    return NextResponse.json([], { status: 200 });
  }

  // Calculate avgRating for each seller
  const sellersWithRating = (sellers || []).map((seller: Seller) => {
    const products = seller.user?.products || [];
    const totalRating = products.reduce((sum: number, p: Product) => sum + (p.rating || 0), 0);
    const avgRating = products.length > 0 ? totalRating / products.length : 0;
    return {
      ...seller,
      avgRating,
    };
  });

  // Optionally filter by minRating (if not handled in SQL)
  let filtered = sellersWithRating;
  if (minRatingParam) {
    const minRating = parseFloat(minRatingParam);
    filtered = sellersWithRating.filter((seller: Seller) => (seller.avgRating ?? 0) >= minRating);
  }

  return NextResponse.json(filtered);
}