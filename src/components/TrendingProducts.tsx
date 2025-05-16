"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  seller: {
    id: string;
    name: string;
    sellerProfile: { businessName: string };
  };
  category: { id: string; name: string; slug: string };
  link: string;
  createdAt: string;
  discountPercentage: number;
  rating?: number;
  reviewCount?: number;
  isFavorite?: boolean;
  mainImage: string;
}

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch trending products
  useEffect(() => {
  const fetchTrending = async () => {
    try {
      const res = await fetch("/api/products?sort=popularity&limit=10");
      const data = await res.json();
      setProducts(
  (data.products || []).map((p: any) => ({
    ...p,
    mainImage:
      Array.isArray(p.images) && p.images[0] && p.images[0].trim() !== ""
        ? p.images[0]
        : "/placeholder-image.jpg",
  }))
);
    } catch {
      setProducts([]);
    }
  };
  fetchTrending();
}, []);

  const checkScrollButtons = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      checkScrollButtons();
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Wishlist logic
  const fetchWishlist = async () => {
  try {
    const res = await fetch("/api/wishlist");
    const data = await res.json();
    setWishlist((data.items || []).map((item: any) => item.productId));
  } catch {
    setWishlist([]);
  }
};

useEffect(() => {
  fetchWishlist();
}, []);

const toggleWishlist = async (id: string) => {
  try {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId: id }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    // Always refetch wishlist after toggle to sync state
    await fetchWishlist();
    toast({
      title: data.added ? "Added to wishlist" : "Removed from wishlist",
      variant: data.added ? "success" : "info",
    });
  } catch {
    toast({ title: "Error updating wishlist", variant: "destructive" });
  }
};

  // Add to cart logic
  const addToCart = async (id: string) => {
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId: id, quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    if (res.ok) {
      // Optionally, refetch cart here if you want to sync state
      setCart((prev) => [...new Set([...prev, id])]);
      toast({
        title: "Added to cart",
        variant: "success",
      });
    } else if (data?.error === "Product not found") {
      toast({
        title: "Product not found",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Already in cart",
        variant: "info",
      });
    }
  } catch {
    toast({
      title: "Error adding to cart",
      variant: "destructive",
    });
  }
};

  // Helper: is new arrival (created within last 7 days)
  const isNewArrival = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary/5 rounded-bl-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-accent/10 rounded-tr-[80px]"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section heading with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
            Trending <span className="text-primary">Products</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most popular handcrafted items that customers are loving right now
          </p>
        </motion.div>

        {/* Navigation arrows */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border ${
              canScrollLeft
                ? "border-gray-200 hover:bg-gray-50 text-gray-700"
                : "border-gray-100 text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border ${
              canScrollRight
                ? "border-gray-200 hover:bg-gray-50 text-gray-700"
                : "border-gray-100 text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Products carousel */}
        <div
          ref={containerRef}
          className="flex overflow-x-auto pb-8 hide-scrollbar gap-6 snap-x snap-mandatory"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4 }}
              className="min-w-[280px] md:min-w-[320px] snap-start"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                {/* Product image container */}
                <div className="relative">
                  {/* Image */}
                  <div className="relative h-[220px] overflow-hidden">
                    <Image
  src={product.mainImage}
  alt={product.name}
  fill
  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
  sizes="(max-width: 768px) 280px, 320px"
/>

<div className="text-xs text-primary/80 mb-1">
  {typeof product.category === "string"
    ? product.category
    : product.category?.name || ""}
</div>

                    {/* Wishlist button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
                      aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors duration-200 ${
                          wishlist.includes(product.id)
                            ? "text-primary fill-primary"
                            : "text-gray-400"
                        } group-hover:text-primary group-hover:fill-primary`}
                      />
                    </button>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {isNewArrival(product.createdAt) && (
                        <Badge className="bg-primary text-white px-2 py-1 text-xs">
                          New Arrival
                        </Badge>
                      )}
                      {product.discountPercentage > 40 && (
                        <Badge className="bg-accent text-primary px-2 py-1 text-xs">
                          Sale
                        </Badge>
                      )}
                    </div>

                    {/* Trending indicator */}
                    <div className="absolute bottom-3 left-3 flex items-center bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-primary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </div>
                  </div>
                </div>

                {/* Product info */}
                <div className="p-4 flex-grow flex flex-col">
                  <div className="text-xs text-primary/80 mb-1">
  {typeof product.category === "string"
    ? product.category
    : product.category?.name || ""}
</div>
                  <Link href={product.link}>
                    <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 hover:text-primary transition-colors duration-200">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="text-xs text-gray-500 mb-2">
  {product.seller?.sellerProfile?.businessName || product.seller?.name || ""}
</div>

                  {/* Price */}
                  <div className="flex items-center mb-3">
                    <span className="font-semibold text-gray-900">
                      ₹{(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                    </span>
                    {product.discountPercentage > 0 && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ₹{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${i < Math.round(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({product.reviewCount ?? 0})</span>
                  </div>

                  {/* Add to cart button */}
                  <div className="mt-auto">
                    <Button
                      className={`w-full bg-primary/10 hover:bg-primary/20 text-primary rounded-full flex items-center justify-center gap-2 transition-colors ${
                        cart.includes(product.id) ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => addToCart(product.id)}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {cart.includes(product.id) ? "Added" : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-8 text-center">
          <Link
            href="/marketplace"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all trending products
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Add custom styles for hiding scrollbar but allowing scroll */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}