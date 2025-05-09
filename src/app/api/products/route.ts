import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const searchQuery = searchParams.get("q");
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: Prisma.ProductWhereInput = {};
    
    if (category) {
      where.categoryId = category;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }
    
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
      ];
    }
    
    // Determine sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    
    switch (sort) {
      case "price-low-high":
        orderBy = { price: "asc" };
        break;
      case "price-high-low":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "popularity":
        orderBy = { viewCount: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }
    
    // Execute query
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);
    
    // Process products to add calculated fields
    const processedProducts = products.map(product => {
      let discountPrice = null;
      let discountPercentage = 0;
      
      if (product.discountPercentage > 0) {
        discountPercentage = product.discountPercentage;
        discountPrice = parseFloat((product.price * (1 - discountPercentage / 100)).toFixed(2));
      }
      
      return {
        ...product,
        discountPrice,
        discountPercentage,
        // Convert images from JSON string to array if needed
        images: typeof product.images === 'string' 
          ? JSON.parse(product.images) 
          : product.images,
      };
    });
    
    return NextResponse.json({
      products: processedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching products" },
      { status: 500 }
    );
  }
}
