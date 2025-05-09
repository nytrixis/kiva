import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const data = await req.json();
    const { 
      orderId, 
      paymentIntentId, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = data;
    
    if (!orderId || !paymentIntentId || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Verify the order belongs to the user
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    
    if (!order || order.userId !== userId) {
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    
    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }
    
    // Update order status to PAID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paidAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Payment successful"
    });
  } catch (error) {
    console.error("Payment success error:", error);
    return NextResponse.json(
      { error: "Failed to process payment success" },
      { status: 500 }
    );
  }
}
