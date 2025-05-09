"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface AddToWishlistButtonProps {
  productId: string;
}

interface WishlistItem {
  id: string;
  product: {
    id: string;
  };
}

export default function AddToWishlistButton({ productId }: AddToWishlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (isAuthenticated) {
      const checkWishlist = async () => {
        try {
          const response = await fetch(`/api/wishlist/check?productId=${productId}`);
          if (response.ok) {
            const data = await response.json();
            setIsInWishlist(data.inWishlist);
          }
        } catch (error) {
          console.error("Error checking wishlist:", error);
        }
      };
      
      checkWishlist();
    }
  }, [isAuthenticated, productId]);
  
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isInWishlist) {
        // Need to get the wishlist item ID first
        const wishlistResponse = await fetch("/api/wishlist");
        const wishlistData = await wishlistResponse.json();
        
        if (!wishlistResponse.ok) {
          throw new Error("Failed to fetch wishlist");
        }
        
        
        const wishlistItem = wishlistData.data.items.find(
          (item: WishlistItem) => item.product.id === productId
        );
        
        if (!wishlistItem) {
          throw new Error("Item not found in wishlist");
        }
        
        const response = await fetch(`/api/wishlist/${wishlistItem.id}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          throw new Error("Failed to remove from wishlist");
        }
        
        setIsInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: "Product has been removed from your wishlist",
          variant: "success",
        });
      } else {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to add to wishlist");
        }
        
        setIsInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: "Product has been added to your wishlist",
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update wishlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      variant="outline"
      className="rounded-full px-6 py-2 border-gray-300 flex items-center justify-center gap-2 transition-colors hover:border-primary"
      size="lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
            <Heart 
        className={`h-5 w-5 ${
          isInWishlist 
            ? 'text-primary fill-primary' 
            : isHovered
              ? 'text-primary'
              : 'text-gray-500'
        }`} 
      />
      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
}

