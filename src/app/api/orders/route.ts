import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { addressId, items } = await req.json();
    
    if (!addressId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Fetch cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId,
        id: { in: items.map((item: any) => item.id) }
      },
      include: {
        product: true
      }
    });
    
    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items found" },
        { status: 400 }
      );
    }
    
    // Calculate order totals
    let subtotal = 0;
    const orderItems = cartItems.map(item => {
      const discountedPrice = item.product.price * (1 - item.product.discountPercentage / 100);
      const itemTotal = discountedPrice * item.quantity;
      subtotal += itemTotal;
      
      return {
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        discountPercentage: item.product.discountPercentage
      };
    });
    
    // Apply fixed shipping and tax rates (you can customize this)
    const shipping = 50; // Fixed shipping rate
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;
    
    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        status: "PENDING",
        subtotal,
        shipping,
        tax,
                total,
        items: {
          create: orderItems
        }
      }
    });
    
    // Clear the cart items that were ordered
    await prisma.cartItem.deleteMany({
      where: {
        userId,
        id: { in: items.map((item: any) => item.id) }
      }
    });
    
    return NextResponse.json({
      success: true,
      orderId: order.id
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

