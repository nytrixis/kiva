import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // Check if user is logged in and is a seller
  if (!token || token.role !== "SELLER") {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/seller/:path*', '/api/seller/:path*']
};
