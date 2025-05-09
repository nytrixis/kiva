import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Kiva",
  description: "Complete your purchase",
};

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/checkout");
  }
  
  const userId = session.user.id;
  
  // Get user's cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  
  // Get user's addresses
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });
  
  // If cart is empty, redirect to cart page
  if (cartItems.length === 0) {
    redirect("/cart");
  }

  const validCartItems = cartItems.map(item => ({
  ...item,
  product: {
    ...item.product,
    seller: {
      id: item.product.seller?.id || "",
      name: item.product.seller?.name || "Unknown Seller"
    }
  }
}));
  
  return <CheckoutClient cartItems={validCartItems} addresses={addresses} />;
}
