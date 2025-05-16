import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReelsClient from "@/components/reels/ReelsClient";

// Add at the top:
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
  _count: { likes: number; comments: number };
  isLiked: boolean;
  user: User;
  product?: Product | null;
  likes?: unknown[]; // Add this line to fix the error
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

  // Fetch initial reels for server-side rendering via Supabase REST API
  const reelsRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/reels?userId=${session.user.id}&take=5`,
    { cache: "no-store" }
  );
  const initialReels = reelsRes.ok ? await reelsRes.json() : [];

  // Transform reels to include isLiked
  const transformedReels = initialReels.map((reel: Reel) => {
    const transformedReel = {
      id: reel.id,
      videoUrl: reel.videoUrl,
      thumbnailUrl: reel.thumbnailUrl || undefined,
      caption: reel.caption || undefined,
      createdAt: typeof reel.createdAt === "string" ? reel.createdAt : new Date(reel.createdAt).toISOString(),
      _count: {
        likes: reel._count?.likes ?? 0,
        comments: reel._count?.comments ?? 0,
      },
      isLiked: Array.isArray(reel.likes) ? reel.likes.length > 0 : false,
      user: {
        id: reel.user?.id,
        name: reel.user?.name,
        image: reel.user?.image,
        sellerProfile: reel.user?.sellerProfile
          ? {
              businessName: reel.user.sellerProfile.businessName,
              logoImage: reel.user.sellerProfile.logoImage,
            }
          : undefined,
      },
      product: reel.product
        ? {
            id: reel.product.id,
            name: reel.product.name,
            price: reel.product.price,
            images: Array.isArray(reel.product.images)
              ? reel.product.images
              : typeof reel.product.images === "string"
              ? JSON.parse(reel.product.images)
              : [],
            discountPercentage: reel.product.discountPercentage,
          }
        : null,
    };
    return transformedReel;
  });

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
          initialReels={transformedReels}
          isSeller={isSeller}
          sellerProducts={sellerProducts}
        />
      </div>
    </div>
  );
}