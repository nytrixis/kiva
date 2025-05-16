import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

interface CartItemRequest {
  id: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_item")
      .select("*, product:product(*)")
      .eq("userId", userId)
      .in("id", items.map((item: CartItemRequest) => item.id));

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items found" },
        { status: 400 }
      );
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems = cartItems.map((item: any) => {
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
    const { data: order, error: orderError } = await supabase
      .from("order")
      .insert([{
        userId,
        addressId,
        status: "PENDING",
        subtotal,
        shipping,
        tax,
        total
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItemsToInsert = orderItems.map((item: any) => ({
      orderId: order.id,
      ...item
    }));

    const { error: orderItemsError } = await supabase
      .from("order_item")
      .insert(orderItemsToInsert);

    if (orderItemsError) throw orderItemsError;

    // Clear the cart items that were ordered
    const { error: deleteError } = await supabase
      .from("cart_item")
      .delete()
      .eq("userId", userId)
      .in("id", items.map((item: CartItemRequest) => item.id));

    if (deleteError) throw deleteError;

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