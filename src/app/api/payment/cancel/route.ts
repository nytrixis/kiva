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
    const data = await req.json();
    const { orderId } = data;
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order ID" },
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
    
    // Update order status to CANCELLED
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Payment cancelled"
    });
  } catch (error) {
    console.error("Payment cancel error:", error);
    return NextResponse.json(
      { error: "Failed to process payment cancellation" },
      { status: 500 }
    );
  }
}
