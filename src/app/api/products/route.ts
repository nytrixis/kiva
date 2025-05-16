import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Seller {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | string;
  discountPercentage: number;
  category?: Category;
  seller?: Seller;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const searchQuery = searchParams.get("q");

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build filter conditions
    let query = supabase
      .from("Product")
      .select(
        `
        *,
        category:categoryId (
          id, name, slug
        ),
        seller:sellerId (
          id, name
        )
      `,
        { count: "exact" }
      );

    if (category) {
      query = query.eq("categoryId", category);
    }

    if (minPrice) {
      query = query.gte("price", parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte("price", parseFloat(maxPrice));
    }

    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      );
    }

    // Determine sort order
    switch (sort) {
      case "price-low-high":
        query = query.order("price", { ascending: true });
        break;
      case "price-high-low":
        query = query.order("price", { ascending: false });
        break;
      case "rating":
        query = query.order("rating", { ascending: false });
        break;
      case "popularity":
        query = query.order("viewCount", { ascending: false });
        break;
      default:
        query = query.order("createdAt", { ascending: false });
    }

    // Pagination
    query = query.range(from, to);

    // Execute query
    const { data: products, count: total, error } = await query;

    if (error) {
      throw error;
    }

    // Process products to add calculated fields
const processedProducts = (products || []).map((product: Product) => {
      let discountPrice = null;
      let discountPercentage = 0;

      if (product.discountPercentage > 0) {
        discountPercentage = product.discountPercentage;
        discountPrice = parseFloat(
          (product.price * (1 - discountPercentage / 100)).toFixed(2)
        );
      }

      return {
        ...product,
        discountPrice,
        discountPercentage,
        images:
          typeof product.images === "string"
            ? JSON.parse(product.images)
            : product.images,
      };
    });

    return NextResponse.json({
      products: processedProducts,
      total: total ?? 0,
      page,
      limit,
      totalPages: Math.ceil((total ?? 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching products" },
      { status: 500 }
    );
  }
}