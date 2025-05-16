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

interface SellerProfile {
  businessName: string;
}

interface Seller {
  id: string;
  name: string;
  sellerProfile?: SellerProfile;
}

interface ProductAPI {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  images: string[];
  discountPercentage: number;
  createdAt: string;
  viewCount: number;
  rating: number;
  reviewCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
    sellerProfile: {
      businessName: string;
    };
  };
  link: string;
}

interface ProductsResponse {
  products: ProductAPI[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // RecentlyViewed logic
    const idsParam = searchParams.get("ids");
    if (idsParam) {
      const ids = idsParam.split(",");
      const { data, error } = await supabase
        .from("Product")
        .select(
          `
          id, name, price, images, discountPercentage, createdAt, viewCount, rating, reviewCount,
          category:categoryId (id, name, slug),
          seller:sellerId (
            id, name,
            sellerProfile:SellerProfile (
              businessName
            )
          )
          `
        )
        .in("id", ids);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ products: [] }, { status: 500 });
      }

      const products: ProductAPI[] = (data as any[]).map((p) => {
        // Supabase returns category and seller as arrays when using foreign key joins
        const category = Array.isArray((p as any).category) ? (p as any).category[0] : (p as any).category;
        const seller = Array.isArray((p as any).seller) ? (p as any).seller[0] : (p as any).seller;
        return {
          id: p.id,
          name: p.name,
          price: p.discountPercentage > 0
            ? Math.round((p.price * (1 - p.discountPercentage / 100)) * 100) / 100
            : p.price,
          originalPrice: p.price,
          images: Array.isArray((p as any).images)
            ? (p as any).images.filter((img: string) => typeof img === "string" && img.trim() !== "")
            : typeof (p as any).images === "string"
              ? JSON.parse((p as any).images).filter((img: string) => typeof img === "string" && img.trim() !== "")
              : [],
          discountPercentage: p.discountPercentage ?? 0,
          createdAt: p.createdAt,
          viewCount: p.viewCount ?? 0,
          rating: p.rating ?? 0,
          reviewCount: p.reviewCount ?? 0,
          category: {
            id: category?.id || "",
            name: category?.name || "",
            slug: category?.slug || "",
          },
          seller: {
            id: seller?.id || "",
            name: seller?.name || "",
            sellerProfile: {
              businessName: seller?.sellerProfile?.businessName || "",
            },
          },
          link: `/products/${p.id}`,
        } as ProductAPI;
      });

      return NextResponse.json({ products });
    }

    // Marketplace & Trending logic
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const searchQuery = searchParams.get("q");

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabase
      .from("Product")
      .select(
        `
        id, name, price, images, discountPercentage, createdAt, viewCount, rating, reviewCount,
        category:categoryId (id, name, slug),
        seller:sellerId (
          id, name,
          sellerProfile:SellerProfile (
            businessName
          )
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

    // Sorting
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
    const { data, count: total, error } = await query;

    if (error) {
      throw error;
    }

    const products: ProductAPI[] = (data as any[]).map((p) => {
      const category = Array.isArray((p as any).category) ? (p as any).category[0] : (p as any).category;
      const seller = Array.isArray((p as any).seller) ? (p as any).seller[0] : (p as any).seller;
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice:
          p.discountPercentage > 0
            ? Math.round((p.price / (1 - p.discountPercentage / 100)) * 100) / 100
            : p.price,
        images: Array.isArray((p as any).images)
          ? (p as any).images.filter((img: string) => typeof img === "string" && img.trim() !== "")
          : typeof (p as any).images === "string"
            ? JSON.parse((p as any).images).filter((img: string) => typeof img === "string" && img.trim() !== "")
            : [],
        discountPercentage: p.discountPercentage ?? 0,
        createdAt: p.createdAt,
        viewCount: p.viewCount ?? 0,
        rating: p.rating ?? 0,
        reviewCount: p.reviewCount ?? 0,
        category: {
          id: category?.id || "",
          name: category?.name || "",
          slug: category?.slug || "",
        },
        seller: {
          id: seller?.id || "",
          name: seller?.name || "",
          sellerProfile: {
            businessName: seller?.sellerProfile?.businessName || "",
          },
        },
        link: `/products/${p.id}`,
      };
    });

    const response: ProductsResponse = {
      products,
      total: total ?? 0,
      page,
      limit,
      totalPages: Math.ceil((total ?? 0) / limit),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching products" },
      { status: 500 }
    );
  }
}