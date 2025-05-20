import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { razorpay } from "@/lib/razorpay";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    const { data: order, error: orderError } = await supabase
      .from("order")
      .select(`
        *,
        address:address(*),
        items:order_item(*, product:product(*))
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get user details for Razorpay
    const { data: user } = await supabase
      .from("user")
      .select("*")
      .eq("id", session.user.id)
      .single();

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
      const { error: updateError } = await supabase
        .from("order")
        .update({ paymentIntentId: razorpayOrder.id })
        .eq("id", order.id);

      if (updateError) {
        throw updateError;
      }

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