"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import WishlistList from "@/components/wishlist/Wishlist";
import { useToast } from "@/hooks/use-toast";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Use useCallback to memoize the fetchWishlist function
  const fetchWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/wishlist');
      
      if (response.status === 401) {
        // Redirect to login if unauthorized
        router.push('/sign-in?callbackUrl=/wishlist');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        // Transform the data to ensure images is always an array
        const transformedItems = data.items.map((item: { product: { images: any[] } }) => ({
          ...item,
          product: {
            ...item.product,
            images: Array.isArray(item.product.images) 
              ? item.product.images 
              : []
          }
        }));
        setWishlistItems(transformedItems);
      } else {
        throw new Error('Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load your wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [router]); // Only depend on router, not toast

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const handleRemoveItem = async (id: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/wishlist?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from wishlist');
      }

      // Update local state
      setWishlistItems(prev => prev.filter((item: { id: string }) => item.id !== id));
      
      toast({
        title: "Item removed",
        description: "Item has been removed from your wishlist",
        variant: "success",
      });
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
        variant: "success",
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-heading text-primary mb-2">My Wishlist</h1>
        <p className="text-gray-600 mb-8">Loading your wishlist...</p>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-primary mb-2">My Wishlist</h1>
      <p className="text-gray-600 mb-8">
        Items you've saved for later
      </p>
      
      {wishlistItems.length > 0 ? (
        <WishlistList 
          items={wishlistItems} 
          onRemoveItem={handleRemoveItem} 
          onAddToCart={handleAddToCart} 
          isUpdating={isUpdating}
        />
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-medium text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">
            Save items you like by clicking the heart icon on products
          </p>
          <a 
            href="/marketplace" 
            className="inline-block px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            Explore Products
          </a>
        </div>
      )}
    </div>
  );
}
