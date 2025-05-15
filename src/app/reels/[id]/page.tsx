import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ReelsClient from "@/components/reels/ReelsClient";

interface ReelPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ReelPageProps): Promise<Metadata> {
  const { id } = params;
  
  // Fetch reel data for metadata
  const reel = await prisma.reel.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          sellerProfile: {
            select: {
              businessName: true,
            },
          },
        },
      },
    },
  });
  
  if (!reel) {
    return {
      title: "Reel Not Found | Kiva",
      description: "The requested reel could not be found",
    };
  }
  
  const sellerName = reel.user.sellerProfile?.businessName || reel.user.name;
  
  return {
    title: `${sellerName}'s Reel | Kiva`,
    description: reel.caption || `Watch ${sellerName}'s reel on Kiva`,
    openGraph: {
      images: [reel.thumbnailUrl || "/images/og-image.jpg"],
    },
  };
}

export default async function ReelPage({ params }: ReelPageProps) {
  const { id } = params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=/reels/${id}`);
  }
  
  const isSeller = session.user.role === "SELLER";
  
  // Fetch the specific reel
  const reel = await prisma.reel.findUnique({
    where: { id },
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
          categoryId: true,
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
  
  if (!reel) {
    redirect("/reels");
  }
  
  // Transform reel to include isLiked
  const transformedReel = {
    ...reel,
    isLiked: reel.likes.length > 0,
    likes: undefined, // Remove the likes array
  };
  
  // Fetch related reels
  const relatedReels = await prisma.reel.findMany({
    where: {
      id: { not: id },
      OR: [
        { userId: reel.userId },
        { product: { categoryId: reel.product?.categoryId } },
      ],
    },
    take: 10,
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
          categoryId: true,
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
  
  // Transform related reels
  const transformedRelatedReels = relatedReels.map(relatedReel => ({
    ...relatedReel,
    isLiked: relatedReel.likes.length > 0,
    likes: undefined,
  }));
  
  // Combine the specific reel with related reels
  const allReels = [transformedReel, ...transformedRelatedReels];
  
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