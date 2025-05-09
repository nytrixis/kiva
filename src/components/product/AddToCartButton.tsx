"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  quantity?: number;
}

export default function AddToCartButton({ 
  productId, 
  stock, 
  quantity = 1 
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }
      
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading || stock === 0}
      className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      size="lg"
    >
      <ShoppingBag className="h-5 w-5" />
      {stock === 0 ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
}
