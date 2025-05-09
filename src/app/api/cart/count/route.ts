import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }
    
    const userId = session.user.id;
    
    // Count cart items
    const cartItemsCount = await prisma.cartItem.count({
      where: { userId },
    });
    
    return NextResponse.json({ count: cartItemsCount });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return NextResponse.json({ count: 0 });
  }
}
