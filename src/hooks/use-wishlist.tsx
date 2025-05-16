"use client";

import { useState } from "react";
import { useToast, ToastVariant } from "@/hooks/use-toast";
import { Check, AlertCircle } from "lucide-react";
import Link from "next/link";

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    discountPercentage: number;
    images: string[] | Record<string, unknown>; // Using any for flexibility with JSON field
    stock?: number;
    rating?: number;
    reviewCount?: number;
    category?: {
      name: string;
    };
    seller?: {
      name: string;
    };
  };
}

// API response interfaces
interface WishlistResponse {
  wishlist: {
    items: WishlistItem[];
  };
}

interface WishlistToggleResponse {
  added: boolean;
}

interface WishlistCheckResponse {
  isInWishlist: boolean;
}

export function useWishlist() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getWishlist = async (): Promise<WishlistItem[]> => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/wishlist");
      
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }
      
      const data = await response.json() as WishlistResponse;
      return data.wishlist?.items || [];
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      
      toast({
        title: "Error",
        description: "Failed to load your wishlist. Please try again.",
        variant: "destructive" as ToastVariant,
        icon: <AlertCircle className="h-4 w-4" />,
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlistItem = async (productId: string): Promise<boolean | null> => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update wishlist");
      }
      
      const data = await response.json() as WishlistToggleResponse;
      
      const isAdded = Boolean(data.added);
      
      toast({
        title: isAdded ? "Added to Wishlist" : "Removed from Wishlist",
        description: isAdded
          ? "The item has been added to your wishlist."
          : "The item has been removed from your wishlist.",
        variant: "success" as ToastVariant,
        icon: <Check className="h-4 w-4" />,
        action: isAdded ? (
          <Link href="/wishlist" className="text-xs underline">
            View Wishlist
          </Link>
        ) : undefined,
      });
      
      return isAdded;
    } catch (error) {
      console.error("Error updating wishlist:", error);
      
      toast({
        title: "Error",
        description: "Failed to update your wishlist. Please try again.",
        variant: "destructive" as ToastVariant,
        icon: <AlertCircle className="h-4 w-4" />,
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/wishlist?id=${wishlistItemId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }
      
      toast({
        title: "Removed from Wishlist",
        description: "The item has been removed from your wishlist.",
        variant: "success" as ToastVariant,
        icon: <Check className="h-4 w-4" />,
      });
      
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      
      toast({
        title: "Error",
        description: "Failed to remove the item from your wishlist. Please try again.",
        variant: "destructive" as ToastVariant,
        icon: <AlertCircle className="h-4 w-4" />,
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = async (productId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/wishlist/check?productId=${productId}`);
      
      if (!response.ok) {
        throw new Error("Failed to check wishlist");
      }
      
      const data = await response.json() as WishlistCheckResponse;
      return Boolean(data.isInWishlist);
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
  };

  return {
    isLoading,
    getWishlist,
    toggleWishlistItem,
    removeFromWishlist,
    isInWishlist,
  };
}
