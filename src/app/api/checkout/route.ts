import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { orderId } = await req.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }
    
    // Fetch the order with all details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Get user details for Razorpay
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    // Create Razorpay order if not already created
    if (!order.paymentIntentId) {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(order.total * 100), // Amount in smallest currency unit (paise)
        currency: "INR",
        receipt: order.id,
        notes: {
          orderId: order.id,
          userId: session.user.id
        }
      });
      
      // Update order with Razorpay order ID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentIntentId: razorpayOrder.id
        }
      });
      
      order.paymentIntentId = razorpayOrder.id;
    }
    
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        razorpayOrderId: order.paymentIntentId,
        amount: order.total,
        currency: "INR",
        name: user?.name || "Customer",
        email: user?.email || "",
        phone: order.address?.phone || user?.phone || "",
        address: order.address
      }
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment details" },
      { status: 500 }
    );
  }
}
