import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    const seller = await prisma.user.findUnique({
      where: { id },
      include: {
        sellerProfile: true,
      },
    });
    
    if (!seller || seller.role !== UserRole.SELLER) {
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    const data = await req.json();
    
    const seller = await prisma.user.findUnique({
      where: { id },
      include: { sellerProfile: true },
    });
    
    if (!seller || seller.role !== UserRole.SELLER || !seller.sellerProfile) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }
    
    // Update seller profile status
    const updatedProfile = await prisma.sellerProfile.update({
      where: { id: seller.sellerProfile.id },
      data: {
        status: data.status,
        isVerified: data.status === "APPROVED",
        verifiedAt: data.status === "APPROVED" ? new Date() : null,
        verifiedBy: data.status === "APPROVED" ? session.user.id : null,
      },
    });
    
    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error("Error updating seller status:", error);
    return NextResponse.json(
      { error: "Failed to update seller status" },
      { status: 500 }
    );
  }
}
