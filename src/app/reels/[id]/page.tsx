import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReelsClient from "@/components/reels/ReelsClient";

interface ReelPageProps {
  params: Promise<{ id: string }>;
}
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
  categoryId?: string;
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
}

interface SellerProduct {
  id: string;
  name: string;
  images: string[];
}


export async function generateMetadata({ params }: ReelPageProps): Promise<Metadata> {
  const { id } = await params;

  // Fetch reel data for metadata via Supabase REST API
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

  // Fetch the specific reel via Supabase REST API
  const reelRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/reel/${id}?userId=${session.user.id}`,
    { cache: "no-store" }
  );
  const reel = reelRes.ok ? await reelRes.json() : null;

  if (!reel) {
    redirect("/reels");
  }

  // Fetch related reels via Supabase REST API
  const relatedRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/related-reels?reelId=${id}&userId=${session.user.id}&categoryId=${reel.product?.categoryId}&userIdMatch=${reel.userId}`,
    { cache: "no-store" }
  );
  const relatedReels = relatedRes.ok ? await relatedRes.json() : [];

  // Transform the specific reel
  const transformedReel = {
    id: reel.id,
    videoUrl: reel.videoUrl,
    thumbnailUrl: reel.thumbnailUrl || undefined,
    caption: reel.caption || undefined,
    createdAt: typeof reel.createdAt === "string" ? reel.createdAt : new Date(reel.createdAt).toISOString(),
    _count: {
  likes: reel._count.likes ?? 0,
  comments: reel._count.comments ?? 0,
},
isLiked: reel.isLiked ?? false,
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

  // Transform related reels
  const transformedRelatedReels = relatedReels.map((relatedReel: Reel) => ({
    id: relatedReel.id,
    videoUrl: relatedReel.videoUrl,
    thumbnailUrl: relatedReel.thumbnailUrl || undefined,
    caption: relatedReel.caption || undefined,
    createdAt: typeof relatedReel.createdAt === "string" ? relatedReel.createdAt : new Date(relatedReel.createdAt).toISOString(),
    _count: {
      likes: relatedReel._count?.likes ?? 0,
      comments: relatedReel._count?.comments ?? 0,
    },
    isLiked: relatedReel.isLiked ?? false,
    user: {
      id: relatedReel.user?.id,
      name: relatedReel.user?.name,
      image: relatedReel.user?.image,
      sellerProfile: relatedReel.user?.sellerProfile
        ? {
            businessName: relatedReel.user.sellerProfile.businessName,
            logoImage: relatedReel.user.sellerProfile.logoImage,
          }
        : undefined,
    },
    product: relatedReel.product
      ? {
          id: relatedReel.product.id,
          name: relatedReel.product.name,
          price: relatedReel.product.price,
          images: Array.isArray(relatedReel.product.images)
            ? relatedReel.product.images
            : typeof relatedReel.product.images === "string"
            ? JSON.parse(relatedReel.product.images)
            : [],
          discountPercentage: relatedReel.product.discountPercentage,
        }
      : null,
  }));

  // Combine the specific reel with related reels
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