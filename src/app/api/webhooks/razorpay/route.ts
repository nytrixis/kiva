import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      const orderId = event.payload.payment.entity.order_id;

      // Update order status
      const { error: updateError } = await supabase
        .from("order")
        .update({
          status: "PAID",
          paidAt: new Date().toISOString()
        })
        .eq("paymentIntentId", orderId);

      if (updateError) throw updateError;
    }

    // Handle payment failure
    if (event.event === "payment.failed") {
      const orderId = event.payload.payment.entity.order_id;

      const { error: updateError } = await supabase
        .from("order")
        .update({
          status: "PENDING"
        })
        .eq("paymentIntentId", orderId);

      if (updateError) throw updateError;
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