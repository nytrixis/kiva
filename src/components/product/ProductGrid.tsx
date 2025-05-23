"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import ProductAverageRating from "./ProductAverageRating";

interface Seller {
  name: string | null;
  id: string;
  sellerProfile?: {
    businessName: string;
  };
}

interface Category {
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage: number;
  images: string[] | Record<string, unknown>;
  rating: number;
  reviewCount: number;
  category: Category;
  seller: Seller;
  isFavorite?: boolean;
  stock?: number;
}

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

export default function ProductGrid({ products, loading = false }: ProductGridProps) {
  // Placeholder for loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="h-64 bg-gray-200 animate-pulse"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No products found
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No products found</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Try adjusting your filters or search criteria to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);  
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Calculate discounted price based on discountPercentage
  const discountPrice = product.discountPercentage > 0 
    ? product.price * (1 - product.discountPercentage / 100) 
    : null;

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      // API call to add to cart
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }
      
      // Show success toast notification
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
        variant: "success",
        icon: <Check className="h-4 w-4" />,
        action: (
          <Link href="/cart" className="text-xs underline">
            View Cart
          </Link>
        ),
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Show error toast notification
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to use wishlist",
        variant: "destructive",
      });
      return;
    }

    // Optimistic UI update
    setIsFavorite(!isFavorite);

    try {
      // API call to toggle wishlist
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist');
      }

      // ...toast...
    } catch {
      // Revert optimistic update
      setIsFavorite(isFavorite);
      toast({
        title: "Error",
        description: "Could not update wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          {/* Product image */}
          <div className="relative h-64 overflow-hidden">
            <Image
              src={Array.isArray(product.images) 
                ? product.images[0] 
                : typeof product.images === 'object' && product.images.hasOwnProperty(0)
                  ? String(product.images[0])
                  : '/placeholder-image.jpg' // Provide a fallback image path
              }
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Discount badge */}
            {product.discountPercentage > 0 && (
              <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                {product.discountPercentage}% OFF
              </div>
            )}
            
            {/* Action buttons */}
            <div className="absolute bottom-3 right-3 flex space-x-2">
              <button
                onClick={toggleWishlist}
                onMouseEnter={() => setIsWishlistHovered(true)}
                onMouseLeave={() => setIsWishlistHovered(false)}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={`h-5 w-5 transition-all ${
                    isWishlistHovered || isFavorite
                      ? 'fill-primary text-primary'
                      : 'text-gray-600'
                  }`}
                />
              </button>
              
              <button
                onClick={addToCart}
                disabled={isAddingToCart}
                className={`p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors ${
                  isAddingToCart ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                aria-label="Add to cart"
              >
                {isAddingToCart ? (
                  <div className="h-5 w-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
          
          {/* Product info */}
          <div className="p-4">
            <div className="text-xs text-primary/80 mb-1">{product.category.name}</div>
            <h3 className="font-medium text-gray-800 mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>
{product.seller?.id ? (
  <p className="text-xs text-primary font-medium mb-2">
    {product.seller.sellerProfile?.businessName || product.seller.name}
  </p>
) : (
  <div className="text-xs text-gray-500 mb-2">
    {product.seller.sellerProfile?.businessName || product.seller.name || 'Unknown Seller'}
  </div>
)}         
            {/* Price */}
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">
                ₹{discountPrice !== null ? discountPrice.toFixed(2) : product.price.toFixed(2)}
              </span>
              
              {discountPrice !== null && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Rating */}
            <ProductAverageRating productId={product.id} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}