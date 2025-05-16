import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Category {
  id: string;
  name: string;
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
  discountPercentage?: number;
  category?: Category;
  seller?: Seller;
}

interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  createdAt: string;
  product?: Product;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's wishlist and items
    let { data: wishlist, error } = await supabase
      .from("Wishlist")
      .select(`
        *,
        items:WishlistItem (
          *,
          product:Product (
            *,
            category:Category(*),
            seller:sellerId(id, name)
          )
        )
      `)
      .eq("userId", session.user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    // If wishlist doesn't exist, create it
    if (!wishlist) {
      const { data: createdWishlist, error: createError } = await supabase
        .from("Wishlist")
        .insert([{ userId: session.user.id }])
        .select(`
          *,
          items:WishlistItem (
            *,
            product:Product (
              *,
              category:Category(*),
              seller:sellerId(id, name)
            )
          )
        `)
        .single();
      if (createError) throw createError;
      wishlist = createdWishlist;
    }

    // Process wishlist items to add calculated fields
    const processedItems = (wishlist.items || []).map((item: WishlistItem) => {
      const product = item.product;
      let discountPrice = null;
      const discountPercentage = product?.discountPercentage || 0;

      if (product && discountPercentage > 0) {
        discountPrice = parseFloat((product.price * (1 - discountPercentage / 100)).toFixed(2));
      }

      return {
        ...item,
        product: {
          ...product,
          discountPrice,
          discountPercentage,
          images: product && typeof product.images === 'string'
            ? JSON.parse(product.images)
            : product?.images,
        },
      };
    });

    return NextResponse.json({
      items: processedItems,
      itemCount: processedItems.length,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from("Product")
      .select("id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get or create user's wishlist
    let { data: wishlist, error: wishlistError } = await supabase
      .from("Wishlist")
      .select("id")
      .eq("userId", session.user.id)
      .single();

    if (wishlistError && wishlistError.code !== "PGRST116") throw wishlistError;

    if (!wishlist) {
      const { data: createdWishlist, error: createError } = await supabase
        .from("Wishlist")
        .insert([{ userId: session.user.id }])
        .select("id")
        .single();
      if (createError) throw createError;
      wishlist = createdWishlist;
    }

    // Check if item already exists in wishlist
    const { data: existingWishlistItem, error: existingError } = await supabase
      .from("WishlistItem")
      .select("id")
      .eq("wishlistId", wishlist.id)
      .eq("productId", productId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingWishlistItem) {
      // Remove item if it already exists (toggle behavior)
      const { error: deleteError } = await supabase
        .from("WishlistItem")
        .delete()
        .eq("id", existingWishlistItem.id);

      if (deleteError) throw deleteError;

      return NextResponse.json({
        message: "Item removed from wishlist",
        added: false,
      });
    } else {
      // Add new item to wishlist
      const { data: wishlistItem, error: addError } = await supabase
        .from("WishlistItem")
        .insert([
          {
            wishlistId: wishlist.id,
            productId,
          },
        ])
        .select("*, product:Product(*)")
        .single();

      if (addError) throw addError;

      return NextResponse.json({
        message: "Item added to wishlist",
        added: true,
        wishlistItem,
      });
    }
  } catch (error) {
    console.error("Error updating wishlist:", error);
    return NextResponse.json(
      { error: "An error occurred while updating wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const wishlistItemId = searchParams.get("id");

    if (!wishlistItemId) {
      return NextResponse.json(
        { error: "Wishlist item ID is required" },
        { status: 400 }
      );
    }

    // Get user's wishlist
    const { data: wishlist, error: wishlistError } = await supabase
      .from("Wishlist")
      .select("id")
      .eq("userId", session.user.id)
      .single();

    if (wishlistError || !wishlist) {
      return NextResponse.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }

    // Check if wishlist item exists and belongs to user's wishlist
    const { data: existingWishlistItem, error: itemError } = await supabase
      .from("WishlistItem")
      .select("id")
      .eq("id", wishlistItemId)
      .eq("wishlistId", wishlist.id)
      .maybeSingle();

    if (itemError || !existingWishlistItem) {
      return NextResponse.json(
        { error: "Wishlist item not found" },
        { status: 404 }
      );
    }

    // Delete wishlist item
    const { error: deleteError } = await supabase
      .from("WishlistItem")
      .delete()
      .eq("id", wishlistItemId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      message: "Item removed from wishlist successfully",
    });
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    return NextResponse.json(
      { error: "An error occurred while removing wishlist item" },
      { status: 500 }
    );
  }
}