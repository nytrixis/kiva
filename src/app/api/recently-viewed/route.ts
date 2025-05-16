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

    const { data, error } = await supabase
      .from("recentlyviewedproduct")
      .select("*")
      .eq("userid", session.user.id)
      .order("createdat", { ascending: false })
      .limit(12);

    if (error) throw error;

    return NextResponse.json({ products: data });
  } catch (error) {
    console.error("Error fetching recently viewed:", error);
    return NextResponse.json({ error: "Failed to fetch recently viewed" }, { status: 500 });
  }
}