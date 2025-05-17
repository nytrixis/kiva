import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// All identifiers are lowercased in Postgres unless quoted, so use lowercase everywhere
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const {
      productId, name, price, originalPrice, image, vendor, category, link,
      discountPercentage, rating, reviewCount
    } = body;

    if (!productId || !name || !price || !image || !vendor || !category || !link) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Remove any existing entry for this user/product
    await supabase
      .from("recentlyviewedproduct")
      .delete()
      .eq("userid", session.user.id)
      .eq("productid", productId);

    // Insert new entry (all keys lowercase to match Postgres)
    const { error } = await supabase
      .from("recentlyviewedproduct")
      .insert([{
        userid: session.user.id,
        productid: productId,
        name,
        price,
        originalprice: originalPrice,
        image,
        vendor,
        category,
        link,
        discountpercentage: discountPercentage,
        rating,
        reviewcount: reviewCount,
        createdat: new Date().toISOString(),
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding recently viewed:", error);
    return NextResponse.json({ error: "Failed to add recently viewed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get recently viewed product IDs
    const { data: recents, error: recentsError } = await supabase
      .from("recentlyviewedproduct")
      .select("productid, createdat")
      .eq("userid", session.user.id)
      .order("createdat", { ascending: false })
      .limit(12);

    if (recentsError) throw recentsError;
    if (!recents || recents.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const ids = recents.map((r) => r.productid);

    // 2. Fetch full product details for these IDs
    const { data: products, error: productsError } = await supabase
      .from("Product")
      .select(`
        id, name, price, images, discountPercentage, createdAt, viewCount, rating, reviewCount, stock,
        category:categoryId (id, name, slug),
        seller:sellerId (
          id, name,
          sellerProfile:SellerProfile (
            businessName
          )
        )
      `)
      .in("id", ids);

    if (productsError) throw productsError;

    // 3. Map and format as needed (reuse your parse functions from wishlist API)
    // ...copy your parseCategory, parseSeller, parseImages from wishlist API...

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
      sellerProfile: SellerProfile;
    }

    interface Product {
      id: string;
      name: string;
      price: number;
      discountPercentage: number;
      createdAt: string;
      viewCount: number;
      rating: number;
      reviewCount: number;
      stock: number;
      images: string[] | string;
      category: Category | Category[];
      seller: Seller | Seller[];
    }

    const parseCategory = (category: Category | Category[] | null | undefined): Category => {
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
    };

interface SellerInput {
  id?: string;
  name?: string;
  sellerProfile?: {
    businessName?: string;
  } | { businessName?: string }[]; // allow array or object
}
type SellerInputType = SellerInput | SellerInput[] | null | undefined;

interface ParsedSeller {
  id: string;
  name: string;
  sellerProfile: {
    businessName: string;
  };
}

const parseSeller = (seller: SellerInputType): ParsedSeller => {
  const s = Array.isArray(seller) ? seller[0] : seller;
  // Handle sellerProfile possibly being an array
  let sellerProfileObj = s?.sellerProfile;
  if (Array.isArray(sellerProfileObj)) {
    sellerProfileObj = sellerProfileObj[0];
  }
  return {
    id: s?.id || "",
    name: s?.name || "",
    sellerProfile: {
      businessName: sellerProfileObj?.businessName || "",
    },
  };
};

    interface ParseImages {
      (images: string[] | string | null | undefined): string[];
    }

    const parseImages: ParseImages = (images) => {
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
    };

    const formatted = (products || []).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      discountPrice: p.discountPercentage > 0
        ? Math.round((p.price * (1 - p.discountPercentage / 100)) * 100) / 100
        : p.price,
      discountPercentage: p.discountPercentage ?? 0,
      images: parseImages(p.images),
      createdAt: p.createdAt,
      viewCount: p.viewCount ?? 0,
      rating: p.rating ?? 0,
      reviewCount: p.reviewCount ?? 0,
      stock: p.stock ?? 1,
      category: parseCategory(p.category),
      seller: parseSeller(p.seller),
      link: `/products/${p.id}`,
    }));

    // 4. Return in the same order as recents
    const ordered = ids.map((id) => formatted.find((p) => p.id === id)).filter(Boolean);

const uniqueOrdered = ordered.filter(
  (product, index, self) =>
    product !== undefined &&
    self.findIndex(p => p && p.id === product.id) === index
);

    return NextResponse.json({ products: uniqueOrdered });
  } catch (error) {
    console.error("Error fetching recently viewed:", error);
    return NextResponse.json({ error: "Failed to fetch recently viewed" }, { status: 500 });
  }
}