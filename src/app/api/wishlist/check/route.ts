import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { isInWishlist: false },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get user's wishlist
    const { data: wishlist, error } = await supabase
      .from("Wishlist")
      .select("id")
      .eq("userId", session.user.id)
      .single();

    if (error || !wishlist) {
      return NextResponse.json({ isInWishlist: false }, { status: 200 });
    }

    // Check if item exists in wishlist
    const { data: wishlistItem } = await supabase
      .from("WishlistItem")
      .select("id")
      .eq("wishlistId", wishlist.id)
      .eq("productId", productId)
      .maybeSingle();

    const isInWishlist = !!wishlistItem;

    return NextResponse.json({ isInWishlist });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return NextResponse.json(
      { error: "An error occurred while checking wishlist", isInWishlist: false },
      { status: 500 }
    );
  }
}