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
enum SellerStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action } = await params;

    // Validate the seller exists
    const { data: seller, error: sellerError } = await supabase
      .from("user")
      .select("*, sellerProfile:seller_profile(*)")
      .eq("id", id)
      .single();

    if (
      sellerError ||
      !seller ||
      !Array.isArray(seller.sellerProfile) ||
      !seller.sellerProfile[0]
    ) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    let newStatus: SellerStatus;
    let isVerified = seller.sellerProfile[0].isVerified;

    // Determine the action to take
    switch (action) {
      case "approve":
        newStatus = SellerStatus.APPROVED;
        isVerified = true;
        break;
      case "reject":
        newStatus = SellerStatus.REJECTED;
        isVerified = false;
        break;
      case "suspend":
        newStatus = SellerStatus.SUSPENDED;
        break;
      case "reset":
        newStatus = SellerStatus.PENDING;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Update the seller profile
    const { error: updateError } = await supabase
      .from("seller_profile")
      .update({
        status: newStatus,
        isVerified,
        verifiedAt: isVerified ? new Date().toISOString() : null,
        verifiedBy: isVerified ? session.user.id : null,
      })
      .eq("userId", id);

    if (updateError) {
      throw updateError;
    }

    // Redirect back to the sellers page
    return NextResponse.redirect(new URL("/admin/sellers", req.url));
  } catch (error) {
    console.error("Error updating seller status:", error);
    return NextResponse.json(
      { error: "Failed to update seller status" },
      { status: 500 }
    );
  }
}