"use client";

import { useState } from "react";
import { useToast } from "./use-toast";

export function useCart() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addToCart = async (productId, quantity = 1) => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }
      
      toast({
        title: "Added to cart",
        description: "The item has been added to your cart.",
      });
      
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add the item to your cart. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItemId,
          quantity,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update cart");
      }
      
      toast({
        title: "Cart updated",
        description: "Your cart has been updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating cart:", error);
      toast({
        title: "Error",
        description: "Failed to update your cart. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/cart?id=${cartItemId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove item");
      }
      
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
      
      return true;
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove the item. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCart = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/cart");
      
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        title: "Error",
        description: "Failed to load your cart. Please try again.",
        variant: "destructive",
      });
      
      return { items: [], subtotal: 0, itemCount: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    getCart,
  };
}
