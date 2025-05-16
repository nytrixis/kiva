import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import CheckoutClient from "@/components/checkout/CheckoutClient";

interface Category {
  name: string;
}

interface Seller {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage: number;
  images: string[] | Record<string, unknown>;
  stock: number;
  category?: Category;
  seller?: Seller;
}

interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export const metadata: Metadata = {
  title: "Checkout | Kiva",
  description: "Complete your purchase",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/checkout");
  }

  const userId = session.user.id;

  // Get user's cart items
  const { data: cartItems = [] } = await supabase
    .from("cart_item")
    .select(`
      *,
      product:product (
        *,
        category:category(*),
        seller:user(id, name)
      )
    `)
    .eq("userId", userId);

  // If cart is empty, redirect to cart page
  if (!cartItems || cartItems.length === 0) {
    redirect("/cart");
  }


  const { data: addresses } = await supabase
  .from("address")
  .select("*")
  .eq("userId", userId)
  .order("isDefault", { ascending: false });

const validAddresses = addresses || [];

const validCartItems = cartItems.map((item: CartItem) => ({
  ...item,
  product: {
    ...item.product,
    images: typeof item.product.images === "string"
      ? JSON.parse(item.product.images)
      : item.product.images,
    seller: {
      id: item.product.seller?.id || "",
      name: item.product.seller?.name || "Unknown Seller"
    }
  }
}));

  return <CheckoutClient cartItems={validCartItems} addresses={validAddresses} />;
}