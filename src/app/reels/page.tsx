import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ReelsClient from "@/components/reels/ReelsClient";

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
  
  // Fetch initial reels for server-side rendering
  const initialReels = await prisma.reel.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          sellerProfile: {
            select: {
              businessName: true,
              logoImage: true,
            },
          },
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          discountPercentage: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      likes: {
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      },
    },
  });
  
  // Transform reels to include isLiked
  const transformedReels = initialReels.map(reel => ({
    ...reel,
    isLiked: reel.likes.length > 0,
    likes: undefined, // Remove the likes array
  }));
  
  // If user is a seller, fetch their products for the upload form
  let sellerProducts: any[] = [];
  
  if (isSeller) {
    sellerProducts = await prisma.product.findMany({
      where: {
        sellerId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
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
