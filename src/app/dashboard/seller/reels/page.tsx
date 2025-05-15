import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
  
  // Fetch seller's reels
const reels = await prisma.reel.findMany({
  where: {
    userId: session.user.id,
  },
  orderBy: {
    createdAt: "desc",
  },
  include: {
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
    product: {
      select: {
        id: true,
        name: true,
        images: true,
      },
    },
  },
}).then(reels => reels.map(reel => ({
  id: reel.id,
  videoUrl: reel.videoUrl,
  thumbnailUrl: reel.thumbnailUrl || undefined,
  caption: reel.caption || undefined,
  createdAt: reel.createdAt.toISOString(), // Convert Date to string
  views: reel.views,
  _count: reel._count,

  product: reel.product ? {
    id: reel.product.id,
    name: reel.product.name,
    images: reel.product.images as string[]
  } : null
})));

  
  // Fetch seller's products for the upload form
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
  }).then(products => products.map(product => ({
    ...product,
    images: product.images as string[]
  })));
  
  return <SellerReelsClient reels={reels} products={products} />;
}