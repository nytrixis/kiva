import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function sellerGuard(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Check if user is logged in and is a seller
  if (!session?.user || session.user.role !== "SELLER") {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }
  
  return NextResponse.next();
}
