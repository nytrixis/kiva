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
        id: string;
      } | null;
      influencerProfile?: {
        id: string;
        platform: string;
        image: string | null;
      } | null;
    };
    product?: {
      id: string;
      name: string;
      price: number;
      images: string[];
      discountPercentage: number;
    } | null;
    _count?: {
      comments: number;
    };
  };
  onLike: (liked: boolean, likeCount: number) => void;
  onComment: (reelId: string) => void;
  onShare: (reelId: string) => void;
  isActive: boolean;
  globalMuted: boolean;
  onToggleGlobalMute: () => void;
  isPaused: boolean;
  onReelTap: () => void;
  showPlayPause: boolean;
}

export default function ReelCard({
  reel,
  onLike,
  onComment,
  onShare,
  isActive,
  globalMuted,
  onToggleGlobalMute,
  isPaused,
  onReelTap,
  showPlayPause,
}: ReelCardProps) {
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [likesCount, setLikesCount] = useState(reel.likeCount);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && !isPaused) {
        videoRef.current.play().catch(error => {
          console.error("Error playing video:", error);
        });
      } else {
        videoRef.current.pause();
        if (!isActive) {
          videoRef.current.currentTime = 0;
        }
      }
    }
  }, [isActive, isPaused]); 
  
  useEffect(() => {
    setIsLiked(reel.isLiked);
    setLikesCount(reel.likeCount);
  }, [reel.id, reel.isLiked, reel.likeCount]);

  
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
    setLikesCount(data.likeCount);

    onLike(data.liked, data.likeCount); 

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
      <div className="absolute inset-0" onClick={onReelTap}> {/* ✅ Add onClick handler */}
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
          muted={globalMuted} // ✅ Use globalMuted instead of isMuted
          poster={reel.thumbnailUrl || undefined}
        />
      </div>
      
      {/* Overlay gradient for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none" />

      {/* ✅ Add Play/Pause overlay */}
      {showPlayPause && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 rounded-full p-4">
            {isPaused ? (
              <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
              </svg>
            ) : (
              <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            )}
          </div>
        </div>
      )}
      
      {/* Mute/unmute button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the tap handler
          onToggleGlobalMute();
        }}
        className="absolute top-4 right-4 p-2 bg-black/40 rounded-full"
      >
        {globalMuted ? (
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
            <Link 
              href={
                reel.user.sellerProfile?.id 
                  ? `/shops/${reel.user.sellerProfile.id}` 
                  : reel.user.influencerProfile?.id 
                    ? `/influencer/${reel.user.influencerProfile.id}`
                    : `/influencer/${reel.user.id}` 
              } 
              className="text-white font-medium hover:underline"
            >
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
            <Heart className={`h-6 w-6 ${isLiked ? 'fill-primary text-primary' : ''}`} />
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
          <span className="text-white text-xs mt-1">{reel.commentCount ?? 0}</span>
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