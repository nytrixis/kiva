import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Update cart item quantity
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { id } = params;
    const { quantity } = await req.json();
    
    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ 
        error: "Quantity must be a positive number" 
      }, { status: 400 });
    }
    
    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        product: true,
      },
    });
    
    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }
    
    // Check if requested quantity is available
    if (cartItem.product.stock < quantity) {
      return NextResponse.json({ 
        error: "Not enough stock available" 
      }, { status: 400 });
    }
    
    // Update cart item quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });
    
    return NextResponse.json({ 
      success: true, 
      data: updatedCartItem 
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

// Remove item from cart
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { id } = params;
    
    // Check if cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId,
      },
    });
    
    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }
    
    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Item removed from cart" 
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
