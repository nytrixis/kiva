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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the seller profile for this user
    const { data: sellerProfile, error: profileError } = await supabase
      .from("SellerProfile")
      .select("*")
      .eq("userId", id)
      .single();

    if (profileError || !sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    // Update seller profile status to APPROVED
    const { error: updateError } = await supabase
      .from("SellerProfile")
      .update({
        status: "APPROVED",
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        verifiedBy: session.user.id,
      })
      .eq("userId", id);

    if (updateError) {
      throw updateError;
    }

    // Redirect back to the seller details page
    return NextResponse.redirect(new URL(`/admin/sellers/${id}`, req.url));
  } catch (error) {
    console.error("Error approving seller:", error);
    return NextResponse.json(
      { error: "Failed to approve seller" },
      { status: 500 }
    );
  }
}