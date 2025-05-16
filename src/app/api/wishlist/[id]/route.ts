import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Remove item from wishlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;

    // Get user's wishlist
    const { data: wishlist, error: wishlistError } = await supabase
      .from("Wishlist")
      .select("id")
      .eq("userId", userId)
      .single();

    if (wishlistError || !wishlist) {
      return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
    }

    // Check if item exists and belongs to user's wishlist
    const { data: wishlistItem, error: itemError } = await supabase
      .from("WishlistItem")
      .select("id")
      .eq("id", id)
      .eq("wishlistId", wishlist.id)
      .maybeSingle();

    if (itemError || !wishlistItem) {
      return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 });
    }

    // Delete the wishlist item
    const { error: deleteError } = await supabase
      .from("WishlistItem")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from wishlist"
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove item from wishlist" },
      { status: 500 }
    );
  }
}