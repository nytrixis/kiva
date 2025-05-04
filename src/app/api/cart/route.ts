import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get cart items for the user
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Process cart items to add calculated fields
    const processedCartItems = cartItems.map(item => {
      const product = item.product;
      let discountPrice = null;
      let discountPercentage = product.discountPercentage || 0;
      
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
    
    // Calculate cart totals
    const subtotal = processedCartItems.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);
    
    return NextResponse.json({
      items: processedCartItems,
      subtotal,
      itemCount: processedCartItems.length,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching cart" },
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
      
      const { productId, quantity = 1 } = await request.json();
      
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
      
      // Check if item already exists in cart
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          userId: session.user.id,
          productId,
        },
      });
      
      let cartItem;
      
      if (existingCartItem) {
        // Update quantity if item already exists
        cartItem = await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + quantity,
          },
          include: {
            product: true,
          },
        });
      } else {
        // Add new item to cart
        cartItem = await prisma.cartItem.create({
          data: {
            userId: session.user.id,
            productId,
            quantity,
          },
          include: {
            product: true,
          },
        });
      }
      
      return NextResponse.json({
        message: "Item added to cart successfully",
        cartItem,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      return NextResponse.json(
        { error: "An error occurred while adding to cart" },
        { status: 500 }
      );
    }
  }
  
  export async function PUT(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      
      const { cartItemId, quantity } = await request.json();
      
      if (!cartItemId) {
        return NextResponse.json(
          { error: "Cart item ID is required" },
          { status: 400 }
        );
      }
      
      if (quantity < 1) {
        return NextResponse.json(
          { error: "Quantity must be at least 1" },
          { status: 400 }
        );
      }
      
      // Check if cart item exists and belongs to user
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          id: cartItemId,
          userId: session.user.id,
        },
      });
      
      if (!existingCartItem) {
        return NextResponse.json(
          { error: "Cart item not found" },
          { status: 404 }
        );
      }
      
      // Update cart item quantity
      const cartItem = await prisma.cartItem.update({
        where: { id: cartItemId },
        data: {
          quantity,
        },
        include: {
          product: true,
        },
      });
      
      return NextResponse.json({
        message: "Cart item updated successfully",
        cartItem,
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
      return NextResponse.json(
        { error: "An error occurred while updating cart item" },
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
      const cartItemId = searchParams.get("id");
      
      if (!cartItemId) {
        return NextResponse.json(
          { error: "Cart item ID is required" },
          { status: 400 }
        );
      }
      
      // Check if cart item exists and belongs to user
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          id: cartItemId,
          userId: session.user.id,
        },
      });
      
      if (!existingCartItem) {
        return NextResponse.json(
          { error: "Cart item not found" },
          { status: 404 }
        );
      }
      
      // Delete cart item
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });
      
      return NextResponse.json({
        message: "Cart item removed successfully",
      });
    } catch (error) {
      console.error("Error removing cart item:", error);
      return NextResponse.json(
        { error: "An error occurred while removing cart item" },
        { status: 500 }
      );
    }
  }
  