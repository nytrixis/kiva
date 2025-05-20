import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SellerProfile {
  status: string;
}

interface Seller {
  id: string;
  name: string;
  image?: string;
  seller_profile?: SellerProfile[];
}

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | string;
  seller?: Seller;
  category?: Category;
}

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build filter for verified sellers
    let query = supabase
      .from("product")
      .select(
        `
        *,
        category:category(id, name, slug),
        seller:user(id, name, image, seller_profile: seller_profile(status))
      `,
        { count: "exact" }
      )
      .order("createdAt", { ascending: false })
      .range(from, to);

    // Add category filter if provided
    if (categoryId) {
      query = query.eq("categoryId", categoryId);
    }

    // Only products where seller's seller_profile.status is APPROVED
    // Supabase can't filter on joined tables directly, so filter in JS after fetch
    const { data: products, count: totalCount, error } = await query;

    if (error) throw error;

    // Filter products where seller's seller_profile.status === "APPROVED"
    const filteredProducts = (products || []).filter(
      (product: Product) =>
        product.seller?.seller_profile &&
        Array.isArray(product.seller.seller_profile) &&
        product.seller.seller_profile[0]?.status === "APPROVED"
    );

    return NextResponse.json({
      success: true,
      data: {
        products: filteredProducts,
        pagination: {
          total: totalCount ?? 0,
          page,
          limit,
          pages: Math.ceil((totalCount ?? 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching verified products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}