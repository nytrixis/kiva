"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react";
import CartList from "@/components/cart/CartList";
import CartSummary from "@/components/cart/CartSummary";
import { useToast, ToastVariant } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Define types based on Prisma schema
interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discountPercentage: number;
    images: string[] | any;
    stock: number;
    category?: {
      name: string;
    };
    seller?: {
      name: string;
    };
  };
}

interface CartResponse {
  items: CartItem[];
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/cart");
        
        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }
        
        const data = await response.json() as CartResponse;
        setCartItems(data.items || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast({
          title: "Error",
          description: "Failed to load your cart. Please try again.",
          variant: "destructive" as ToastVariant,
          icon: <AlertCircle className="h-4 w-4" />,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [toast]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItemId: itemId,
          quantity: newQuantity,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update cart");
      }
      
      // Update the local state
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      
      toast({
        title: "Cart updated",
        description: "Your cart has been updated successfully.",
        variant: "success" as ToastVariant,
        icon: <Check className="h-4 w-4" />,
      });
    } catch (error) {
      console.error("Error updating cart:", error);
      toast({
        title: "Error",
        description: "Failed to update your cart. Please try again.",
        variant: "destructive" as ToastVariant,
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove item");
      }
      
      // Update the local state
      setCartItems(cartItems.filter(item => item.id !== itemId));
      
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
        variant: "success" as ToastVariant,
        icon: <Check className="h-4 w-4" />,
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove the item. Please try again.",
        variant: "destructive" as ToastVariant,
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/sign-in?redirect=/checkout");
      return;
    }
    
    router.push("/checkout");
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
            <ShoppingBag className="mr-3 h-8 w-8 text-primary" />
            Your Shopping Bag
          </h1>
          <Link
            href="/collections"
            className="text-primary hover:text-primary/80 flex items-center transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-medium text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/collections"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full inline-block transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartList
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                isUpdating={isUpdating}
              />
            </div>
            <div>
              <CartSummary
                items={cartItems}
                onCheckout={handleCheckout}
                isUpdating={isUpdating}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
