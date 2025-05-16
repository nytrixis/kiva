import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get cart items for the user
    const { data: cartItems, error } = await supabase
      .from("CartItem")
      .select(`
        *,
        product:Product(
          *,
          category:Category(*),
          seller:sellerId(id, name)
        )
      `)
      .eq("userId", session.user.id)
      .order("createdAt", { ascending: false });

    if (error) {
      throw error;
    }

    // Process cart items to add calculated fields
    const processedCartItems = (cartItems || []).map((item: any) => {
      const product = item.product;
      let discountPrice = null;
      const discountPercentage = product?.discountPercentage || 0;

      if (discountPercentage > 0) {
        discountPrice = parseFloat((product.price * (1 - discountPercentage / 100)).toFixed(2));
      }

      return {
        ...item,
        product: {
          ...product,
          discountPrice,
          discountPercentage,
          images: typeof product.images === "string"
            ? JSON.parse(product.images)
            : product.images,
        },
      };
    });

    // Calculate cart totals
    const subtotal = processedCartItems.reduce((sum: number, item: any) => {
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
    const { data: product } = await supabase
      .from("Product")
      .select("*")
      .eq("id", productId)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if item already exists in cart
    const { data: existingCartItem } = await supabase
      .from("CartItem")
      .select("*")
      .eq("userId", session.user.id)
      .eq("productId", productId)
      .single();

    let cartItem;

    if (existingCartItem) {
      // Update quantity if item already exists
      const { data: updatedCartItem, error: updateError } = await supabase
        .from("CartItem")
        .update({
          quantity: existingCartItem.quantity + quantity,
        })
        .eq("id", existingCartItem.id)
        .select()
        .single();

      if (updateError) throw updateError;
      cartItem = updatedCartItem;
    } else {
      // Add new item to cart
      const { data: newCartItem, error: insertError } = await supabase
        .from("CartItem")
        .insert([
          {
            userId: session.user.id,
            productId,
            quantity,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      cartItem = newCartItem;
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
    const { data: existingCartItem } = await supabase
      .from("CartItem")
      .select("*")
      .eq("id", cartItemId)
      .eq("userId", session.user.id)
      .single();

    if (!existingCartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Update cart item quantity
    const { data: cartItem, error: updateError } = await supabase
      .from("CartItem")
      .update({
        quantity,
      })
      .eq("id", cartItemId)
      .select()
      .single();

    if (updateError) throw updateError;

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
    const { data: existingCartItem } = await supabase
      .from("CartItem")
      .select("*")
      .eq("id", cartItemId)
      .eq("userId", session.user.id)
      .single();

    if (!existingCartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Delete cart item
    const { error: deleteError } = await supabase
      .from("CartItem")
      .delete()
      .eq("id", cartItemId);

    if (deleteError) throw deleteError;

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