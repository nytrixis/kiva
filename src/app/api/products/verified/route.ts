import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
      seller: {
        sellerProfile: {
          status: "APPROVED",
        },
      },
    };
    
    // Add category filter if provided
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Fetch products from verified sellers
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });
    
    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        products,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        }
      }
    });
  } catch (error) {
    console.error("Error fetching verified products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
