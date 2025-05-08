import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { extendedPrisma } from '@/lib/prisma-extended';



export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const data = await req.json();
    
    // Create or update seller profile
    const sellerProfile = await extendedPrisma.sellerProfile.upsert({
      where: { userId },
      update: {
        businessName: data.businessName,
        businessType: data.businessType,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        taxId: data.taxId,
        website: data.website,
        phoneNumber: data.phoneNumber,
        categories: data.categories,
      },
      create: {
        userId,
        businessName: data.businessName,
        businessType: data.businessType,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        taxId: data.taxId,
        website: data.website,
        phoneNumber: data.phoneNumber,
        categories: data.categories,
        status: "PENDING",
      },
    });
    
    // Update user role to SELLER if not already
    if (user.role !== UserRole.SELLER) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.SELLER }
      });
    }
    
    return NextResponse.json({ success: true, data: sellerProfile });
  } catch (error) {
    console.error("Error creating seller profile:", error);
    return NextResponse.json(
      { error: "Failed to create seller profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const sellerProfile = await extendedPrisma.sellerProfile.findUnique({
      where: { userId },
    });
    
    if (!sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: sellerProfile });
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch seller profile" },
      { status: 500 }
    );
  }
}
