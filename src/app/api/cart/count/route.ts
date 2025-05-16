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

    // Count cart items
    const { count, error } = await supabase
      .from("CartItem")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return NextResponse.json({ count: 0 });
  }
}