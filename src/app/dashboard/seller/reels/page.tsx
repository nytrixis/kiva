import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SellerReelsClient from "@/app/dashboard/seller/reels/SellerReelsClient";

export const metadata: Metadata = {
  title: "Manage Reels | Seller Dashboard | Kiva",
  description: "Create and manage your product reels",
};

export default async function SellerReelsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard/seller/reels");
  }

  if (session.user.role !== "SELLER") {
    redirect("/dashboard");
  }

  // Fetch seller's reels from REST API
  const reelsRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/seller/reels`,
    { cache: "no-store" }
  );
  const reels = reelsRes.ok ? await reelsRes.json() : [];

  // Fetch seller's products for the upload form from REST API
  const productsRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/seller/products`,
    { cache: "no-store" }
  );
  const products = productsRes.ok ? await productsRes.json() : [];

  return <SellerReelsClient reels={reels} products={products} />;
}