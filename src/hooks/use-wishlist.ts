"use client";

import { useState } from "react";
import { useToast } from "./use-toast";

export function useWishlist() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getWishlist = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/wishlist");
      
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }
      
      const data = await response.json();
      return data.wishlist?.items || [];
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to load your wishlist. Please try again.",
        variant: "destructive",
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlistItem = async (productId) => {
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
      
      const data = await response.json();
      
      toast({
        title: data.added ? "Added to wishlist" : "Removed from wishlist",
        description: data.added 
          ? "The item has been added to your wishlist." 
          : "The item has been removed from your wishlist.",
      });
      
      return data.added;
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to update your wishlist. Please try again.",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/wishlist?id=${wishlistItemId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }
      
      toast({
        title: "Removed from wishlist",
        description: "The item has been removed from your wishlist.",
      });
      
      return true;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove the item from your wishlist. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/wishlist/check?productId=${productId}`);
      
      if (!response.ok) {
        throw new Error("Failed to check wishlist");
      }
      
      const data = await response.json();
      return data.isInWishlist;
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
