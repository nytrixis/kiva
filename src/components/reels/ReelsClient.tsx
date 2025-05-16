"use client";

import { useState } from "react";
import ReelsViewer from "@/components/reels/ReelsViewer";
import ReelUpload from "@/components/reels/ReelUpload";
import { useEffect } from "react";

interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    sellerProfile?: {
      businessName: string;
      logoImage: string | null;
    } | null;
  };
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
    discountPercentage: number;
  } | null;
}


interface SellerProduct {
  id: string;
  name: string;
  images: string[];
}


interface ReelsClientProps {
  initialReels: Reel[];
  isSeller: boolean;
  sellerProducts: SellerProduct[];
}





export default function ReelsClient({
  initialReels,
  isSeller,
  sellerProducts,
}: ReelsClientProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
  // Add class to body when component mounts
  document.body.classList.add('reels-view');
  
  // Remove class when component unmounts
  return () => {
    document.body.classList.remove('reels-view');
  };
}, []);
  
  return (
    <div className="h-full">
    <div className="h-[calc(100vh-64px)] w-full bg-black">
      <ReelsViewer
        initialReels={initialReels}
        isSeller={isSeller}
        onUpload={() => setShowUploadModal(true)}
      />
      
      {showUploadModal && (
        <ReelUpload
          products={sellerProducts}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
    </div>
  );
}
