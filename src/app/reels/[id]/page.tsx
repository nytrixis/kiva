import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ReelsClient from "@/components/reels/ReelsClient";

interface ReelPageProps {
  params: Promise<{ id: string }>;
}
interface Product {
  id: string;
  name: string;
  images: string[];
}

export async function generateMetadata({ params }: ReelPageProps): Promise<Metadata> {
  const { id } = await params;
  
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
  const { id } = await params;
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
  const transformedReel = {
    id: reel.id,
    videoUrl: reel.videoUrl,
    thumbnailUrl: reel.thumbnailUrl || undefined,
    caption: reel.caption || undefined,
    createdAt: reel.createdAt.toISOString(),
    _count: {
      likes: reel._count.likes,
      comments: reel._count.comments,
    },
    isLiked: reel.likes.length > 0,
    user: {
      id: reel.user.id,
      name: reel.user.name,
      image: reel.user.image,
      sellerProfile: reel.user.sellerProfile ? {
        businessName: reel.user.sellerProfile.businessName,
        logoImage: reel.user.sellerProfile.logoImage,
      } : undefined,
    },
    product: reel.product ? {
      id: reel.product.id,
      name: reel.product.name,
      price: reel.product.price,
      images: Array.isArray(reel.product.images)
        ? reel.product.images
        : typeof reel.product.images === 'string'
          ? JSON.parse(reel.product.images)
          : [],
      discountPercentage: reel.product.discountPercentage,
    } : null,
  };

  const transformedRelatedReels = relatedReels.map(relatedReel => ({
    id: relatedReel.id,
    videoUrl: relatedReel.videoUrl,
    thumbnailUrl: relatedReel.thumbnailUrl || undefined,
    caption: relatedReel.caption || undefined,
    createdAt: relatedReel.createdAt.toISOString(),
    _count: {
      likes: relatedReel._count.likes,
      comments: relatedReel._count.comments,
    },
    isLiked: relatedReel.likes.length > 0,
    user: {
      id: relatedReel.user.id,
      name: relatedReel.user.name,
      image: relatedReel.user.image,
      sellerProfile: relatedReel.user.sellerProfile ? {
        businessName: relatedReel.user.sellerProfile.businessName,
        logoImage: relatedReel.user.sellerProfile.logoImage,
      } : undefined,
    },
    product: relatedReel.product ? {
      id: relatedReel.product.id,
      name: relatedReel.product.name,
      price: relatedReel.product.price,
      images: Array.isArray(relatedReel.product.images)
        ? relatedReel.product.images
        : typeof relatedReel.product.images === 'string'
          ? JSON.parse(relatedReel.product.images)
          : [],
      discountPercentage: relatedReel.product.discountPercentage,
    } : null,
  }));
  
  // Combine the specific reel with related reels
  const allReels = [transformedReel, ...transformedRelatedReels];
  
  // If user is a seller, fetch their products for the upload form
  let sellerProducts: Product[] = [];
  
  if (isSeller) {
    const products = await prisma.product.findMany({
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
    
    sellerProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      images: product.images as string[]
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