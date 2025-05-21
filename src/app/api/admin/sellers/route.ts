import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
  INFLUENCER = "INFLUENCER",
}
// enum SellerStatus {
//   PENDING = "PENDING",
//   APPROVED = "APPROVED",
//   REJECTED = "REJECTED",
//   SUSPENDED = "SUSPENDED",
// }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;

    // Build filter
    let query = supabase
  .from("SellerProfile")
  .select("*, user:User(*)")
  .eq("user.role", UserRole.SELLER);

    if (status) {
      query = query.filter("SellerProfile.status", "eq", status);
    }

    const { data: sellers, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: sellers });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return NextResponse.json(
      { error: "Failed to fetch sellers" },
      { status: 500 }
    );
  }
}