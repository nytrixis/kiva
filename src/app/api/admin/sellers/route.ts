import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { extendedPrisma } from '@/lib/prisma-extended';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;
    
    // Fetch sellers with their profiles using extendedPrisma
    const sellers = await extendedPrisma.user.findMany({
      where: {
        role: UserRole.SELLER,
        sellerProfile: status ? { status: status as any } : undefined,
      },
      include: {
        sellerProfile: true,
      },
    });
    
    return NextResponse.json({ success: true, data: sellers });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return NextResponse.json(
      { error: "Failed to fetch sellers" },
      { status: 500 }
    );
  }
}
