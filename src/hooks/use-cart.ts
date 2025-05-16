"use client";
import { useState } from "react";
import { useToast } from "./use-toast";

interface CartProduct {
  id: string;
  name: string;
  price: number;
  discountPercentage: number;
  images: string[];
  stock: number;
  category?: {
    name: string;
  };
  seller?: {
    name: string;
  };
}

interface CartItem {
  id: string;
  product: CartProduct;
  quantity: number;
}

interface CartData {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export function useCart() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Add a product to the cart
   * @param productId - The ID of the product to add
   * @param quantity - The quantity to add (default: 1)
   * @returns Promise<boolean> - Whether the operation was successful
   */
  const addToCart = async (productId: string, quantity = 1): Promise<boolean> => {
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

  /**
   * Update the quantity of an item in the cart
   * @param cartItemId - The ID of the cart item to update
   * @param quantity - The new quantity
   * @returns Promise<boolean> - Whether the operation was successful
   */
  const updateQuantity = async (cartItemId: string, quantity: number): Promise<boolean> => {
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

  /**
   * Remove an item from the cart
   * @param cartItemId - The ID of the cart item to remove
   * @returns Promise<boolean> - Whether the operation was successful
   */
  const removeItem = async (cartItemId: string): Promise<boolean> => {
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

  /**
   * Fetch the current cart data
   * @returns Promise<CartData> - The cart data
   */
  const getCart = async (): Promise<CartData> => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/cart");
      
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      
      const data: CartData = await response.json();
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
