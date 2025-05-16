import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  name: string;
  createdAt: string;
}

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

interface Shop {
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
  user: User;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

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
      products = productsData.map((p: any) => ({
        ...p,
        category: Array.isArray(p.category) ? p.category[0] : p.category,
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