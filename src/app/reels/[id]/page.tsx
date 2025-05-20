import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReelsClient from "@/components/reels/ReelsClient";

interface ReelPageProps {
  params: Promise<{ id: string }>;
}
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
  categoryId?: string;
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

export async function generateMetadata({ params }: ReelPageProps): Promise<Metadata> {
  const { id } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/reel/${id}`,
    { cache: "no-store" }
  );
  const reel = res.ok ? await res.json() : null;

  if (!reel) {
    return {
      title: "Reel Not Found | Kiva",
      description: "The requested reel could not be found",
    };
  }

  const sellerName = reel.user?.sellerProfile?.businessName || reel.user?.name || "Seller";

  return {
    title: `${sellerName}'s Reel | Kiva`,
    description: reel.caption || `Watch ${sellerName}'s reel on Kiva`,
    openGraph: {
      images: [reel.thumbnailUrl || "/images/og-image.jpg"],
    },
  };
}

export default async function ReelPage({ params }: ReelPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=/reels/${id}`);
  }

  const isSeller = session.user.role === "SELLER";

  // Fetch the specific reel (basic data)
  const reelRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/reel/${id}`,
    { cache: "no-store" }
  );
  const reel = reelRes.ok ? await reelRes.json() : null;

  if (!reel) {
    redirect("/reels");
  }

  // Fetch engagement data
  const engagementRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/reels/${id}/engagement`,
    { cache: "no-store" }
  );
  const engagement = engagementRes.ok ? await engagementRes.json() : {};

  // Merge engagement into reel
  const transformedReel = {
    ...reel,
  likeCount: engagement.likeCount ?? 0,
  commentCount: engagement.commentCount ?? 0,
  isLiked: engagement.isLiked ?? false,
  user: {
    id: reel.user?.id,
    name: reel.user?.sellerProfile?.businessName || reel.user?.name,
    image: reel.user?.sellerProfile?.logoImage || reel.user?.image,
    sellerProfile: reel.user?.sellerProfile
      ? {
          businessName: reel.user.sellerProfile.businessName,
          logoImage: reel.user.sellerProfile.logoImage,
        }
      : undefined,
  },
  };

  console.log("Transformed Reel:", transformedReel);

  // Fetch related reels (optional, keep as is if you want)
  const relatedRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/related-reels?reelId=${id}&userId=${session.user.id}&categoryId=${reel.product?.categoryId}&userIdMatch=${reel.userId}`,
    { cache: "no-store" }
  );
  const relatedReels = relatedRes.ok ? await relatedRes.json() : [];

  // Transform related reels (if you want to show them)
  const transformedRelatedReels = relatedReels.map((relatedReel: Reel) => ({
    ...relatedReel,
  likeCount: relatedReel.likeCount ?? 0,
  commentCount: relatedReel.commentCount ?? 0,
  isLiked: relatedReel.isLiked ?? false,
  user: {
    id: relatedReel.user?.id,
    name: relatedReel.user?.sellerProfile?.businessName || relatedReel.user?.name,
    image: relatedReel.user?.sellerProfile?.logoImage || relatedReel.user?.image,
    sellerProfile: relatedReel.user?.sellerProfile
      ? {
          businessName: relatedReel.user.sellerProfile.businessName,
          logoImage: relatedReel.user.sellerProfile.logoImage,
        }
      : undefined,
  },
  }));

  const allReels = [transformedReel, ...transformedRelatedReels];

  // If user is a seller, fetch their products for the upload form via Supabase REST API
  let sellerProducts: SellerProduct[] = [];

  if (isSeller) {
    const productsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/seller-products?sellerId=${session.user.id}`,
      { cache: "no-store" }
    );
    const products = productsRes.ok ? await productsRes.json() : [];

    sellerProducts = products.map((product: Product): SellerProduct => ({
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
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-[calc(100vh*9/16)] h-[calc(100vh-120px)] my-[60px]">
        <ReelsClient
          initialReels={allReels}
          isSeller={isSeller}
          sellerProducts={sellerProducts}
        />
      </div>
    </div>
  );
}