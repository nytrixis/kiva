import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { isInWishlist: false },
        { status: 200 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Get user's wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          where: {
            productId,
          },
        },
      },
    });
    
    const isInWishlist = wishlist?.items.length > 0;
    
    return NextResponse.json({ isInWishlist });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return NextResponse.json(
      { error: "An error occurred while checking wishlist", isInWishlist: false },
      { status: 500 }
    );
  }
}
