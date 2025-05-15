"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSwipeable } from "react-swipeable";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import ReelCard from "./ReelCard";
import ReelComments from "./ReelComments";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
  };
  isLiked: boolean;
  user: {
    id: string;
    name: string;
    image: string;
    sellerProfile?: {
      businessName: string;
      logoImage: string;
    };
  };
  product?: {
    id: string;
    name: string;
    price: number;
    images: any;
    discountPercentage: number;
  };
}

interface ReelsViewerProps {
  initialReels?: Reel[];
  isSeller?: boolean;
  onUpload?: () => void;
}

export default function ReelsViewer({
  initialReels = [],
  isSeller = false,
  onUpload,
}: ReelsViewerProps) {
  const [reels, setReels] = useState<Reel[]>(initialReels);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [commentReelId, setCommentReelId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  // Fetch initial reels if not provided
  useEffect(() => {
    if (initialReels.length === 0) {
      fetchReels();
    }
  }, [initialReels]);
  
  // Fetch reels from API
  const fetchReels = async (cursor?: string) => {
    setIsLoading(true);
    
    try {
      const url = new URL("/api/reels", window.location.origin);
      
      if (cursor) {
        url.searchParams.append("cursor", cursor);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch reels");
      }
      
      const data = await response.json();
      
      if (cursor) {
        setReels(prev => [...prev, ...data.reels]);
      } else {
        setReels(data.reels);
      }
      
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Error fetching reels:", error);
      toast({
        title: "Error",
        description: "Failed to load reels",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load more reels when reaching the end
  const loadMoreReels = () => {
    if (nextCursor && !isLoading) {
      fetchReels(nextCursor);
    }
  };
  
  // Check if we need to load more reels
  useEffect(() => {
    if (activeIndex >= reels.length - 2 && nextCursor && !isLoading) {
      loadMoreReels();
    }
  }, [activeIndex, reels.length, nextCursor, isLoading]);
  
  // Handle navigation
  const goToReel = (index: number) => {
    if (index >= 0 && index < reels.length) {
      setActiveIndex(index);
      
      // Scroll to the reel
      const reelElement = document.getElementById(`reel-${index}`);
      if (reelElement && containerRef.current) {
        containerRef.current.scrollTo({
          top: reelElement.offsetTop,
          behavior: "smooth",
        });
      }
    }
  };
  
  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => goToReel(activeIndex + 1),
    onSwipedDown: () => goToReel(activeIndex - 1),
    preventScrollOnSwipe: true,
    trackMouse: false
  });
  
  // Handle scroll events to determine active reel
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const reelHeight = container.clientHeight;
      
      // Calculate which reel is most visible
      const index = Math.round(scrollTop / reelHeight);
      
      if (index !== activeIndex && index >= 0 && index < reels.length) {
        setActiveIndex(index);
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [activeIndex, reels.length]);
  
  // Handle like action
  const handleLike = async (reelId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like reels",
        variant: "destructive",
      });
      return;
    }
    
    // Update is handled in the ReelCard component
  };
  
  // Handle comment action
  const handleComment = (reelId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment on reels",
        variant: "destructive",
      });
      return;
    }
    
    setCommentReelId(reelId);
  };
  
  // Handle share action
  const handleShare = async (reelId: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check out this reel on Kiva",
          url: `${window.location.origin}/reels/${reelId}`,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(`${window.location.origin}/reels/${reelId}`);
        toast({
          title: "Link copied",
          description: "Reel link copied to clipboard",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  
  return (
    <div className="relative h-full w-full">
      {/* Reels container */}
      <div
        {...swipeHandlers}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        ref={containerRef}
      >
        {reels.length > 0 ? (
          reels.map((reel, index) => (
            <div
              key={reel.id}
              id={`reel-${index}`}
              className="h-full w-full snap-start snap-always"
            >
              <ReelCard
                reel={reel}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                isActive={index === activeIndex}
              />
            </div>
          ))
        ) : isLoading ? (
          <div className="h-full w-full flex items-center justify-center bg-black">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-black text-white p-4 text-center">
            <p className="text-xl font-medium mb-4">No reels found</p>
            <p className="text-gray-400 mb-6">
              {isSeller
                ? "Start creating reels to showcase your products"
                : "Check back later for new content"}
            </p>
            {isSeller && onUpload && (
              <Button
                onClick={onUpload}
                className="bg-primary hover:bg-primary/90"
              >
                Create Your First Reel
              </Button>
            )}
          </div>
        )}
        
        {/* Loading indicator at the bottom */}
        {isLoading && reels.length > 0 && (
          <div className="h-20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}
      </div>
      
      {/* Upload button for sellers */}
      {isSeller && onUpload && (
        <button
          onClick={onUpload}
          className="absolute bottom-6 right-6 z-10 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Upload reel"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
      
      {/* Comments modal */}
      {commentReelId && (
        <ReelComments
          reelId={commentReelId}
          onClose={() => setCommentReelId(null)}
        />
      )}
    </div>
  );
}