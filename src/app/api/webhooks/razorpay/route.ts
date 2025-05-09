import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(body)
      .digest("hex");
    
    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    
    const event = JSON.parse(body);
    
    // Handle payment success
    if (event.event === "payment.captured") {
      // const paymentId = event.payload.payment.entity.id;
      const orderId = event.payload.payment.entity.order_id;
      
      // Update order status
      await prisma.order.update({
        where: { paymentIntentId: orderId },
        data: {
          status: "PAID",
          paidAt: new Date()
        }
      });
    }
    
    // Handle payment failure
    if (event.event === "payment.failed") {
      const orderId = event.payload.payment.entity.order_id;
      
      await prisma.order.update({
        where: { paymentIntentId: orderId },
        data: {
          status: "PENDING"
        }
      });
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
