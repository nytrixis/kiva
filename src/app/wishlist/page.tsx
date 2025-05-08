"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import WishlistList from "@/components/wishlist/Wishlist";
import { useToast } from "@/hooks/use-toast";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/wishlist");
        
        if (!response.ok) {
          throw new Error("Failed to fetch wishlist");
        }
        
        const data = await response.json();
        setWishlistItems(data.wishlist?.items || []);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to load your wishlist. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [toast]);

  const removeFromWishlist = async (itemId) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/wishlist?id=${itemId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove item");
      }
      
      // Update the local state
      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
      
      toast({
        title: "Item removed",
        description: "The item has been removed from your wishlist.",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove the item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }
      
      toast({
        title: "Added to cart",
        description: "The item has been added to your cart.",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add the item to your cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl md:text-4xl text-foreground flex items-center">
            <Heart className="mr-3 h-8 w-8 text-primary fill-primary" />
            Your Wishlist
          </h1>
          <Link 
            href="/collections" 
            className="text-primary hover:text-primary/80 flex items-center transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-medium text-gray-700 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Save items you love for later by adding them to your wishlist.</p>
            <Link 
              href="/collections" 
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full inline-block transition-colors"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div>
            <WishlistList 
              items={wishlistItems} 
              onRemoveItem={removeFromWishlist} 
              onAddToCart={addToCart}
              isUpdating={isUpdating}
            />
          </div>
        )}
      </div>
    </div>
  );
}
