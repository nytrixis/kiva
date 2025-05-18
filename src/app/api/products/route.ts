import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SellerProfile {
  businessName: string;
}

interface CategoryAPI {
  id: string;
  name: string;
  slug: string;
}

interface SellerAPI {
  id: string;
  name: string;
  sellerProfile: {
    businessName: string;
  };
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
  category: CategoryAPI;
  seller: SellerAPI;
  link: string;
  isFavorite?: boolean;
}

interface ProductsResponse {
  products: ProductAPI[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Helper types for Supabase join results
type SupabaseCategory = CategoryAPI | CategoryAPI[] | null | undefined;
type SupabaseSeller = {
  id?: string;
  name?: string;
  sellerProfile?: SellerProfile | null;
} | {
  id?: string;
  name?: string;
  sellerProfile?: SellerProfile | null;
}[] | null | undefined;

type SupabaseProduct = {
  id: string;
  name: string;
  price: number;
  images: string[] | string;
  discountPercentage: number;
  createdAt: string;
  viewCount?: number;
  rating?: number;
  reviewCount?: number;
  category?: SupabaseCategory;
  seller?: SupabaseSeller;
};

function parseCategory(category: SupabaseCategory): CategoryAPI {
  if (Array.isArray(category)) {
    return {
      id: category[0]?.id || "",
      name: category[0]?.name || "",
      slug: category[0]?.slug || "",
    };
  }
  return {
    id: category?.id || "",
    name: category?.name || "",
    slug: category?.slug || "",
  };
}

function parseSeller(seller: SupabaseSeller): SellerAPI {
  const s = Array.isArray(seller) ? seller[0] : seller;
  // Defensive: handle sellerProfile as array or object
  let businessName = "";
  if (s?.sellerProfile) {
    if (Array.isArray(s.sellerProfile)) {
      businessName = s.sellerProfile[0]?.businessName || "";
    } else {
      businessName = s.sellerProfile?.businessName || "";
    }
  }
  return {
    id: s?.id || "",
    name: s?.name || "",
    sellerProfile: {
      businessName,
    },
  };
}

function parseImages(images: string[] | string | undefined): string[] {
  if (Array.isArray(images)) {
    return images.filter((img) => typeof img === "string" && img.trim() !== "");
  }
  if (typeof images === "string") {
    try {
      const arr = JSON.parse(images);
      if (Array.isArray(arr)) {
        return arr.filter((img) => typeof img === "string" && img.trim() !== "");
      }
    } catch {
      return [];
    }
  }
  return [];
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

      const products: ProductAPI[] = (data as SupabaseProduct[]).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.discountPercentage > 0
          ? Math.round((p.price * (1 - p.discountPercentage / 100)) * 100) / 100
          : p.price,
        originalPrice: p.price,
        images: parseImages(p.images),
        discountPercentage: p.discountPercentage ?? 0,
        createdAt: p.createdAt,
        viewCount: p.viewCount ?? 0,
        rating: p.rating ?? 0,
        reviewCount: p.reviewCount ?? 0,
        category: parseCategory(p.category),
        seller: parseSeller(p.seller),
        link: `/products/${p.id}`,
        isFavorite: favoriteIds.has(p.id), 
      }));

      return NextResponse.json({ products });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // 2. Fetch wishlist product IDs for this user
    let favoriteIds: Set<string> = new Set();
    if (userId) {
      const { data: wishlist } = await supabase
        .from("Wishlist")
        .select("productId")
        .eq("userId", userId);
      favoriteIds = new Set(wishlist?.map((w) => w.productId));
    }

    // Marketplace & Trending logic
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minRating = searchParams.get("minRating");
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
      sellerProfile:SellerProfile!SellerProfile_userId_fkey (
        businessName
          )
        )
        `,
        { count: "exact" }
      );

      

    if (category) {
      query = query.eq("categoryId", category);
    }
    // if (minPrice) {
    //   query = query.gte("price", parseFloat(minPrice));
    // }
    // if (maxPrice) {
    //   query = query.lte("price", parseFloat(maxPrice));
    // }
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
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    let filteredProducts = data as SupabaseProduct[];

// Filter by discounted price
    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : undefined;
      const max = maxPrice ? parseFloat(maxPrice) : undefined;
      filteredProducts = filteredProducts.filter((p) => {
        const discounted = p.price * (1 - (p.discountPercentage ?? 0) / 100);
        if (min !== undefined && discounted < min) return false;
        if (max !== undefined && discounted > max) return false;
        return true;
      });
    }
    if (minRating) {
      const min = parseFloat(minRating);
      filteredProducts = filteredProducts.filter(
        (p) => (p.rating ?? 0) >= min
      );
    }

// Paginate AFTER filtering
const paginatedProducts = filteredProducts.slice((page - 1) * limit, page * limit);

const products: ProductAPI[] = paginatedProducts.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  originalPrice:
    p.discountPercentage > 0
      ? Math.round((p.price / (1 - p.discountPercentage / 100)) * 100) / 100
      : p.price,
  images: parseImages(p.images),
  discountPercentage: p.discountPercentage ?? 0,
  createdAt: p.createdAt,
  viewCount: p.viewCount ?? 0,
  rating: p.rating ?? 0,
  reviewCount: p.reviewCount ?? 0,
  category: parseCategory(p.category),
  seller: parseSeller(p.seller),
  link: `/products/${p.id}`,
  isFavorite: favoriteIds.has(p.id),
}));

const response: ProductsResponse = {
  products,
  total: filteredProducts.length,
  page,
  limit,
  totalPages: Math.ceil(filteredProducts.length / limit),
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