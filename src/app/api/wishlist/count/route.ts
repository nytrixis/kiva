import {  NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }
    
    const userId = session.user.id;
    
    // First check if user has a wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: { items: true },
    });
    
    // If no wishlist exists, return 0
    if (!wishlist) {
      return NextResponse.json({ count: 0 });
    }
    
    return NextResponse.json({ count: wishlist.items.length });
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
    return NextResponse.json({ count: 0 });
  }
}
