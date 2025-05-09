import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user's wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    // If wishlist doesn't exist, create it
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId: session.user.id,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  seller: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }
    
    // Process wishlist items to add calculated fields
    const processedItems = wishlist.items.map(item => {
      const product = item.product;
      let discountPrice = null;
      const discountPercentage = product.discountPercentage || 0;
      
      if (discountPercentage > 0) {
        discountPrice = parseFloat((product.price * (1 - discountPercentage / 100)).toFixed(2));
      }
      
      return {
        ...item,
        product: {
          ...product,
          discountPrice,
          discountPercentage,
          // Convert images from JSON string to array if needed
          images: typeof product.images === 'string' 
            ? JSON.parse(product.images) 
            : product.images,
        },
      };
    });
    
    return NextResponse.json({
        items: processedItems,
        itemCount: processedItems.length,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Get or create user's wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId: session.user.id,
        },
      });
    }
    
    // Check if item already exists in wishlist
    const existingWishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });
    
    if (existingWishlistItem) {
      // Remove item if it already exists (toggle behavior)
      await prisma.wishlistItem.delete({
        where: { id: existingWishlistItem.id },
      });
      
      return NextResponse.json({
        message: "Item removed from wishlist",
        added: false,
      });
    } else {
      // Add new item to wishlist
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
        include: {
          product: true,
        },
      });
      
      return NextResponse.json({
        message: "Item added to wishlist",
        added: true,
        wishlistItem,
      });
    }
  } catch (error) {
    console.error("Error updating wishlist:", error);
    return NextResponse.json(
      { error: "An error occurred while updating wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const wishlistItemId = searchParams.get("id");
    
    if (!wishlistItemId) {
      return NextResponse.json(
        { error: "Wishlist item ID is required" },
        { status: 400 }
      );
    }
    
    // Get user's wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    
    if (!wishlist) {
      return NextResponse.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }
    
    // Check if wishlist item exists and belongs to user's wishlist
    const existingWishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        id: wishlistItemId,
        wishlistId: wishlist.id,
      },
    });
    
    if (!existingWishlistItem) {
      return NextResponse.json(
        { error: "Wishlist item not found" },
        { status: 404 }
      );
    }
    
    // Delete wishlist item
    await prisma.wishlistItem.delete({
      where: { id: wishlistItemId },
    });
    
    return NextResponse.json({
      message: "Item removed from wishlist successfully",
    });
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    return NextResponse.json(
      { error: "An error occurred while removing wishlist item" },
      { status: 500 }
    );
  }
}
