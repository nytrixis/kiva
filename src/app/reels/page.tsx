import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReelsClient from "@/components/reels/ReelsClient";

interface SellerProfile {
  businessName: string;
  logoImage?: string;
}

interface User {
  id: string;
  name: string;
  image?: string;
  sellerProfile?: SellerProfile;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | string;
  discountPercentage: number;
}

interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  user: User;
  product?: Product | null;
}

interface SellerProduct {
  id: string;
  name: string;
  images: string[];
}

export const metadata: Metadata = {
  title: "Reels | Kiva",
  description: "Discover products through short videos",
};

export default async function ReelsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/reels");
  }

  const isSeller = session.user.role === "SELLER";

  // Fetch initial reels for server-side rendering via new API
  const reelsRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/reels/feed?limit=5`,
    { cache: "no-store" }
  );
  const { reels: initialReels = [] } = reelsRes.ok ? await reelsRes.json() : { reels: [] };

  // If user is a seller, fetch their products for the upload form via Supabase REST API
  let sellerProducts: SellerProduct[] = [];

  if (isSeller) {
    const productsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/seller-products?sellerId=${session.user.id}`,
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
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-full max-w-[calc(100vh*9/16)] h-[calc(100vh-120px)] my-[60px]">
        <ReelsClient
          initialReels={initialReels}
          isSeller={isSeller}
          sellerProducts={sellerProducts}
        />
      </div>
    </div>
  );
}