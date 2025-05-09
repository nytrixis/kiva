"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    discountPercentage: number;
    images: any;
    stock: number;
    category: {
      name: string;
    } | null;
    seller: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  // Get the first image or placeholder
  const productImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : "https://via.placeholder.com/300";
  
  // Calculate sale price if there's a discount
  const salePrice = product.price - (product.price * (product.discountPercentage / 100));
  
  // Check if product has a significant discount (>40%)
  const hasSignificantDiscount = product.discountPercentage > 40;
  
  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingToWishlist(true);
    
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id }),
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
    } catch {
      toast({
        title: "Error",
        description: "Failed to add product to wishlist",
        variant: "destructive",
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }
      
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
        variant: "success",
      });
    } catch  {
        toast({
          title: "Error",
          description: "Failed to add product to cart",
          variant: "destructive",
        });
      } finally {
        setIsAddingToCart(false);
      }
    };
    
    // Check if product is in wishlist on component mount
    useEffect(() => {
      if (isAuthenticated) {
        const checkWishlist = async () => {
          try {
            const response = await fetch(`/api/wishlist/check?productId=${product.id}`);
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
    }, [isAuthenticated, product.id]);
  
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
        {/* Product image container */}
        <div className="relative">
          {/* Image */}
          <Link href={`/products/${product.id}`}>
            <div className="relative h-[220px] overflow-hidden group">
              <Image
                src={productImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </Link>
          
          {/* Favorite button */}
          <button 
            onClick={handleAddToWishlist}
            disabled={isAddingToWishlist}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
            aria-label={isInWishlist ? "Remove from favorites" : "Add to favorites"}
            onMouseEnter={() => setIsWishlistHovered(true)}
            onMouseLeave={() => setIsWishlistHovered(false)}
          >
            <Heart 
              className={`h-4 w-4 ${
                isInWishlist 
                  ? 'text-primary fill-primary' 
                  : isWishlistHovered
                    ? 'text-primary'
                    : 'text-gray-400'
              }`} 
            />
          </button>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.stock <= 5 && product.stock > 0 && (
              <Badge className="bg-orange-100 text-orange-800 px-2 py-1 text-xs">
                Only {product.stock} left
              </Badge>
            )}
            
            {product.stock === 0 && (
              <Badge className="bg-red-100 text-red-800 px-2 py-1 text-xs">
                Out of Stock
              </Badge>
            )}
            
            {hasSignificantDiscount && (
              <Badge className="bg-red-100 text-red-800 px-2 py-1 text-xs">
                Sale
              </Badge>
            )}
          </div>
        </div>
        
        {/* Product info */}
        <div className="p-4 flex-grow flex flex-col">
          <div className="text-xs text-primary/80 mb-1">{product.category?.name || "Uncategorized"}</div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>
          </Link>
          
          {product.seller?.name && (
            <Link href={`/sellers/${product.seller.id}`} className="text-xs text-gray-500 mb-2 hover:text-primary">
              {product.seller.name}
            </Link>
          )}
          
          {/* Price */}
          <div className="flex items-center mb-3">
            {product.discountPercentage > 0 ? (
              <>
                <span className="font-semibold text-gray-900">${salePrice.toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through ml-2">
                  ${product.price.toFixed(2)}
                </span>
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                  {Math.round(product.discountPercentage)}% OFF
                </span>
              </>
            ) : (
              <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          {/* Add to cart button */}
          <div className="mt-auto">
            <Button 
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock === 0}
              className="w-full bg-primary/10 hover:bg-primary/20 text-primary rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
