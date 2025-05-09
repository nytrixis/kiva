import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserRole, SellerStatus } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id, action } = params;
    
    // Validate the seller exists
    const seller = await prisma.user.findUnique({
      where: { id },
      include: { sellerProfile: true },
    });
    
    if (!seller || !seller.sellerProfile) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }
    
    let newStatus: SellerStatus;
    let isVerified = seller.sellerProfile.isVerified;
    
    // Determine the action to take
    switch (action) {
      case "approve":
        newStatus = "APPROVED";
        isVerified = true;
        break;
      case "reject":
        newStatus = "REJECTED";
        isVerified = false;
        break;
      case "suspend":
        newStatus = "SUSPENDED";
        break;
      case "reset":
        newStatus = "PENDING";
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
    
    // Update the seller profile
    //removed this part 
    //const sellerProfile =
    await prisma.sellerProfile.update({
      where: { userId: id },
      data: {
        status: newStatus,
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: isVerified ? session.user.id : null,
      },
    });
    
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
