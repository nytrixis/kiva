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

    const { data: seller, error } = await supabase
      .from("user")
      .select("*, sellerProfile:seller_profile(*)")
      .eq("id", id)
      .single();

    if (error || !seller || seller.role !== UserRole.SELLER) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: seller });
  } catch (error) {
    console.error("Error fetching seller:", error);
    return NextResponse.json(
      { error: "Failed to fetch seller" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    // Fetch seller and profile
    const { data: seller, error: sellerError } = await supabase
      .from("user")
      .select("*, sellerProfile:seller_profile(*)")
      .eq("id", id)
      .single();

    if (
      sellerError ||
      !seller ||
      seller.role !== UserRole.SELLER ||
      !Array.isArray(seller.sellerProfile) ||
      !seller.sellerProfile[0]
    ) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const sellerProfileId = seller.sellerProfile[0].id;

    // Update seller profile status
    const { data: updatedProfile, error: updateError } = await supabase
      .from("seller_profile")
      .update({
        status: data.status,
        isVerified: data.status === "APPROVED",
        verifiedAt: data.status === "APPROVED" ? new Date().toISOString() : null,
        verifiedBy: data.status === "APPROVED" ? session.user.id : null,
      })
      .eq("id", sellerProfileId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error("Error updating seller status:", error);
    return NextResponse.json(
      { error: "Failed to update seller status" },
      { status: 500 }
    );
  }
}