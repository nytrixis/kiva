import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReelsClient from "@/components/reels/ReelsClient";

// interface SellerProfile {
//   businessName: string;
//   logoImage?: string;
// }

// interface User {
//   id: string;
//   name: string;
//   image?: string;
//   sellerProfile?: SellerProfile;
// }

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | string;
  discountPercentage: number;
}

// interface Reel {
//   id: string;
//   videoUrl: string;
//   thumbnailUrl?: string;
//   caption?: string;
//   createdAt: string;
//   likeCount: number;
//   commentCount: number;
//   isLiked: boolean;
//   user: User;
//   product?: Product | null;
// }

interface SellerProduct {
  id: string;
  name: string;
  images: string[];
}

export const metadata: Metadata = {
  title: "Reels | Ajyaa",
  description: "Discover products through short videos",
};

export default async function ReelsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/reels");
  }

  const isSeller = session.user.role === "SELLER";
  const isInfluencer = session.user.role === "INFLUENCER";

  let sellerProducts: SellerProduct[] = [];

  if (isSeller) {
    // Fetch seller's products
    const productsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/seller/products`,
      { cache: "no-store" }
    );
    const products = productsRes.ok ? await productsRes.json() : [];
    sellerProducts = products.map((product: Product) => ({
      id: product.id,
      name: product.name,
      images: Array.isArray(product.images)
        ? product.images
        : typeof product.images === "string"
        ? JSON.parse(product.images)
        : [],
    }));
  } else if (isInfluencer) {
    // Fetch all products for influencers
    const productsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products`,
      { cache: "no-store" }
    );
    const productsData = productsRes.ok ? await productsRes.json() : { products: [] };
    const products = productsData.products || []; 
    sellerProducts = products.map((product: Product) => ({
      id: product.id,
      name: product.name,
      images: Array.isArray(product.images)
        ? product.images
        : typeof product.images === "string"
        ? JSON.parse(product.images)
        : [],
    }));
  }

  // Fetch reels as usual
  const reelsRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/reels`,
    { cache: "no-store" }
  );
  const reels = reelsRes.ok ? await reelsRes.json() : [];

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-[calc(100vh*9/16)] h-[calc(100vh-120px)] my-[60px]">
        <ReelsClient
          initialReels={reels}
          isSeller={isSeller}
          isInfluencer={isInfluencer}
          sellerProducts={sellerProducts}
        />
      </div>
    </div>
  );
}