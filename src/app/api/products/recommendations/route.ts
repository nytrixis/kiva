import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get categories from query string (these are category names, not IDs)
    const { searchParams } = new URL(req.url);
    const categoriesParam = searchParams.get("categories");
    if (!categoriesParam) {
      return NextResponse.json({ products: [] });
    }
    const categoryNames = categoriesParam.split(",").map((c) => c.trim()).filter(Boolean);

    if (categoryNames.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // 1. Get category IDs for the given names
    const { data: categories, error: catError } = await supabase
      .from("category")
      .select("id, name")
      .in("name", categoryNames);

    if (catError) {
      return NextResponse.json({ error: catError.message }, { status: 500 });
    }
    const categoryIds = (categories || []).map((cat) => cat.id);

    if (categoryIds.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // 2. Get products in those categories
    const { data: products, error: prodError } = await supabase
      .from("product")
      .select(`
        id, name, price, images, discountPrice, discountPercentage, rating, stock,
        categoryId,
        sellerId
      `)
      .in("categoryId", categoryIds)
      .limit(12);

    if (prodError) {
      return NextResponse.json({ error: prodError.message }, { status: 500 });
    }

    // 3. Attach category and seller info
    // 3. Attach category and seller info
    const allCategoryIds = [...new Set((products || []).map((p) => p.categoryId))];
    const allSellerIds = [...new Set((products || []).map((p) => p.sellerId))];

    const [{ data: categoryListRaw }, { data: sellerListRaw }] = await Promise.all([
      supabase.from("category").select("id, name").in("id", allCategoryIds),
      supabase.from("sellerprofile").select("userId, businessName").in("userId", allSellerIds),
    ]);
    const categoryList = categoryListRaw ?? [];
    const sellerList = sellerListRaw ?? [];

    // Map for quick lookup
    const categoryMap = Object.fromEntries(categoryList.map((c) => [c.id, c]));
    const sellerMap = Object.fromEntries(sellerList.map((s) => [s.userId, s]));

    // Attach info, always send category and seller objects
    const formatted = (products || []).map((p) => ({
      ...p,
      category: categoryMap[p.categoryId]
        ? { name: categoryMap[p.categoryId].name }
        : { name: "Uncategorized" },
      seller: sellerMap[p.sellerId]
        ? { name: sellerMap[p.sellerId].businessName }
        : { name: "Unknown Seller" },
    }));

    return NextResponse.json({ products: formatted });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching recommendations" },
      { status: 500 }
    );
  }
}