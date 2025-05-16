import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    const userId = session.user.id;

    // First check if user has a wishlist
    const { data: wishlist, error } = await supabase
      .from("Wishlist")
      .select("id")
      .eq("userId", userId)
      .single();

    if (error || !wishlist) {
      return NextResponse.json({ count: 0 });
    }

    // Count wishlist items
    const { count, error: countError } = await supabase
      .from("WishlistItem")
      .select("id", { count: "exact", head: true })
      .eq("wishlistId", wishlist.id);

    if (countError) {
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
    return NextResponse.json({ count: 0 });
  }
}