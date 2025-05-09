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
    
    // Update seller profile status to SUSPENDED
    //removed this part
    //const sellerProfile = 
    await prisma.sellerProfile.update({
      where: { userId: id },
      data: {
        status: "SUSPENDED",
      },
    });
    
    // Redirect back to the seller details page
    return NextResponse.redirect(new URL(`/admin/sellers/${id}`, req.url));
  } catch (error) {
    console.error("Error suspending seller:", error);
    return NextResponse.json(
      { error: "Failed to suspend seller" },
      { status: 500 }
    );
  }
}
