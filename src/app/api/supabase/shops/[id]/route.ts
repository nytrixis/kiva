import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Category {
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage: number;
  images: string[] | string;
  rating: number;
  reviewCount: number;
  stock: number;
  category?: Category;
}

export async function GET(req: NextRequest) {
  // Extract id from the URL path
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const id = pathParts[pathParts.length - 1]; // last part is [id]
  const q = url.searchParams.get("q");

  // 1. Fetch the shop (seller profile) and user
  const { data: shop, error: shopError } = await supabase
    .from("SellerProfile")
    .select(`
      *,
      user:userId (
        id,
        name,
        createdAt
      )
    `)
    .eq("id", id)
    .single();

  if (shopError || !shop) {
    return NextResponse.json(null, { status: 404 });
  }

  // 2. Fetch products for this seller (where Product.sellerId = shop.user.id)
  let products: Product[] = [];
  if (shop.user?.id) {
    const { data: productsData, error: productsError } = await supabase
      .from("Product")
      .select(`
        id,
        name,
        price,
        discountPercentage,
        images,
        rating,
        reviewCount,
        stock,
        category:categoryId (
          name
        )
      `)
      .eq("sellerId", shop.user.id);

    if (!productsError && productsData) {
      products = productsData.map((p: {
        id: string;
        name: string;
        price: number;
        discountPercentage: number;
        images: string[] | string;
        rating: number;
        reviewCount: number;
        stock: number;
        category: Category[] | Category | null;
      }) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        discountPercentage: p.discountPercentage,
        images: p.images,
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        category: Array.isArray(p.category) ? p.category[0] : p.category ?? undefined,
      }));
    }
  }

  // 3. Optionally filter products by search query
  if (q) {
    const qLower = q.toLowerCase();
    products = products.filter((p: Product) =>
      typeof p.name === "string" && p.name.toLowerCase().includes(qLower)
    );
  }

  // 4. Return the shop with filtered products
  return NextResponse.json({
    ...shop,
    user: {
      ...shop.user,
      products,
    },
  });
}