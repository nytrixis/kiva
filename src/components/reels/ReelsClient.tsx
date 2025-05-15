"use client";

import { useState } from "react";
import ReelsViewer from "@/components/reels/ReelsViewer";
import ReelUpload from "@/components/reels/ReelUpload";
import { useEffect } from "react";

interface ReelsClientProps {
  initialReels: any[];
  isSeller: boolean;
  sellerProducts: any[];
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
