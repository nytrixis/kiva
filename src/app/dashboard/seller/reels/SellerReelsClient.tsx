"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Film, Plus, Trash2, Eye, Heart, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ReelUpload from "@/components/reels/ReelUpload";

interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
  views: number;
  _count: {
    likes: number;
    comments: number;
  };
  product?: {
    id: string;
    name: string;
    images: any;
  } | null;
}

interface Product {
  id: string;
  name: string;
  images: any;
}

interface SellerReelsClientProps {
  reels: Reel[];
  products: Product[];
}

export default function SellerReelsClient({ reels: initialReels, products }: SellerReelsClientProps) {
  const [reels, setReels] = useState<Reel[]>(initialReels);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  const handleDeleteReel = async (reelId: string) => {
    if (confirm("Are you sure you want to delete this reel? This action cannot be undone.")) {
      setIsDeleting(reelId);
      
      try {
        const response = await fetch(`/api/reels/${reelId}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          throw new Error("Failed to delete reel");
        }
        
        // Remove the deleted reel from the state
        setReels(reels.filter(reel => reel.id !== reelId));
        
        toast({
          title: "Reel deleted",
          description: "Your reel has been deleted successfully",
          variant: "success",
        });
      } catch (error) {
        console.error("Error deleting reel:", error);
        toast({
          title: "Error",
          description: "Failed to delete reel",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-heading text-primary mb-2">Reels</h1>
          <p className="text-gray-600">
            Create and manage your product reels to showcase your products
          </p>
        </div>
        
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Reel
        </Button>
      </div>
      
      {reels.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Film className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No reels yet</h2>
          <p className="text-gray-500 mb-6">
            Create your first reel to showcase your products in action
          </p>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            Create Your First Reel
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reels.map(reel => (
            <div
              key={reel.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="relative aspect-[9/16] w-full bg-gray-100">
                {reel.thumbnailUrl ? (
                  <Image
                    src={reel.thumbnailUrl}
                    alt={reel.caption || "Reel thumbnail"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <Film className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                <Link href={`/reels/${reel.id}`} className="absolute inset-0">
                  <span className="sr-only">View reel</span>
                </Link>
                
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Link
                    href={`/reels/${reel.id}`}
                    className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(reel.createdAt), { addSuffix: true })}
                    </p>
                    {reel.caption && (
                      <p className="text-gray-900 line-clamp-2 mt-1">{reel.caption}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDeleteReel(reel.id)}
                    disabled={isDeleting === reel.id}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Delete reel"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                {reel.product && (
                  <Link href={`/products/${reel.product.id}`}>
                    <div className="flex items-center bg-gray-50 p-2 rounded-lg mt-2">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        <Image
                          src={Array.isArray(reel.product.images) && reel.product.images.length > 0
                            ? reel.product.images[0]
                            : "/images/placeholder-product.jpg"}
                          alt={reel.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="ml-2 text-sm text-gray-700 line-clamp-1">
                        {reel.product.name}
                      </p>
                    </div>
                  </Link>
                )}
                
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{reel.views}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{reel._count.likes}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>{reel._count.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showUploadModal && (
        <ReelUpload
          products={products}
          onClose={() => {
            setShowUploadModal(false);
            router.refresh(); // Refresh the page to show the new reel
          }}
        />
      )}
    </div>
  );
}
