"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
// import { useInView } from "react-intersection-observer";
import { Heart, MessageCircle, Share2, ShoppingBag, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
// import { Button } from "@/components/ui/button";

interface ReelCardProps {
  reel: {
    id: string;
    videoUrl: string;
    thumbnailUrl?: string | null;
    caption?: string | null;
    createdAt: string;
    _count: {
      likes: number;
      comments: number;
    };
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
  };
  onLike: () => void;
  onComment: (reelId: string) => void;
  onShare: (reelId: string) => void;
  isActive: boolean;
}


export default function ReelCard({
  reel,
  onLike,
  onComment,
  onShare,
  isActive,
}: ReelCardProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [likesCount, setLikesCount] = useState(reel._count.likes);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Play/pause video based on visibility
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(error => {
          console.error("Error playing video:", error);
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);
  
  // Handle like action
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like reels",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/reels/${reel.id}/like`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to like/unlike reel");
      }
      
      const data = await response.json();
      setIsLiked(data.liked);
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
      
      // Call parent handler
      onLike();
    } catch (error) {
      console.error("Error liking reel:", error);
      toast({
        title: "Error",
        description: "Failed to like/unlike reel",
        variant: "destructive",
      });
    }
  };  
  // Format the price with discount if applicable
  const formatPrice = () => {
    if (!reel.product) return null;
    
    const { price, discountPercentage } = reel.product;
    const discountedPrice = price * (1 - discountPercentage / 100);
    
    return (
      <div className="flex items-center">
        <span className="font-semibold text-white">
          ₹{discountedPrice.toFixed(2)}
        </span>
        {discountPercentage > 0 && (
          <>
            <span className="ml-2 text-xs text-gray-300 line-through">
              ₹{price.toFixed(2)}
            </span>
            <span className="ml-2 text-xs bg-primary/20 text-white px-1.5 py-0.5 rounded">
              {Math.round(discountPercentage)}% OFF
            </span>
          </>
        )}
      </div>
    );
  };
  
  return (
    <div className="relative h-full w-full bg-black">
      {/* Video */}
      <div className="absolute inset-0">
        {reel.thumbnailUrl && !isActive && (
          <Image
            src={reel.thumbnailUrl}
            alt="Reel thumbnail"
            fill
            className="object-cover"
            priority
          />
        )}
        <video
          ref={videoRef}
          src={reel.videoUrl}
          className="h-full w-full object-cover"
          loop
          playsInline
          muted={isMuted}
          poster={reel.thumbnailUrl || undefined}
        />
      </div>
      
      {/* Overlay gradient for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none" />
      
      {/* Mute/unmute button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 p-2 bg-black/40 rounded-full"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-white" />
        ) : (
          <Volume2 className="h-5 w-5 text-white" />
        )}
      </button>
      
      {/* User info and caption */}
      <div className="absolute bottom-4 left-4 right-12">
        <div className="flex items-center mb-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white">
            <Image
                src={
                    reel.user.sellerProfile?.logoImage || 
                    reel.user.image || 
                    "/images/placeholder-avatar.jpg"
                }
                alt={reel.user.sellerProfile?.businessName || reel.user.name || "User"}
                fill
                className="object-cover"
                />

          </div>
          <div className="ml-2">
            <Link href={`/sellers/${reel.user.id}`} className="text-white font-medium hover:underline">
              {reel.user.sellerProfile?.businessName || reel.user.name}
            </Link>
            <p className="text-xs text-gray-300">
              {formatDistanceToNow(new Date(reel.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {reel.caption && (
          <p className="text-white text-sm mb-3 line-clamp-2">{reel.caption}</p>
        )}
        
        {/* Product info if available */}
        {reel.product && (
          <Link href={`/products/${reel.product.id}`}>
            <div className="flex items-center bg-black/40 p-2 rounded-lg mb-3 mr-7">
              <div className="relative h-12 w-12 rounded-md overflow-hidden">
                <Image
                  src={Array.isArray(reel.product.images) && reel.product.images.length > 0
                    ? reel.product.images[0]
                    : "/images/placeholder-product.jpg"}
                  alt={reel.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-2 flex-1">
                <p className="text-white text-sm font-medium line-clamp-1">
                  {reel.product.name}
                </p>
                {formatPrice()}
              </div>
              <ShoppingBag className="h-5 w-5 text-white ml-2" />
            </div>
          </Link>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6">
        <button
          onClick={handleLike}
          className="flex flex-col items-center"
        >
          <div className={`p-2 bg-black/40 rounded-full ${isLiked ? 'text-primary' : 'text-white'}`}>
            <Heart className={`h-6 w-6 ${isLiked ? 'fill-primary' : ''}`} />
          </div>
          <span className="text-white text-xs mt-1">{likesCount}</span>
        </button>
        
        <button
          onClick={() => onComment(reel.id)}
          className="flex flex-col items-center"
        >
          <div className="p-2 bg-black/40 rounded-full text-white">
            <MessageCircle className="h-6 w-6" />
          </div>
          <span className="text-white text-xs mt-1">{reel._count.comments}</span>
        </button>
        
        <button
          onClick={() => onShare(reel.id)}
          className="flex flex-col items-center"
        >
          <div className="p-2 bg-black/40 rounded-full text-white">
            <Share2 className="h-6 w-6" />
          </div>
          <span className="text-white text-xs mt-1">Share</span>
        </button>
      </div>
    </div>
  );
}