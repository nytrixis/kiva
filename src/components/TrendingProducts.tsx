"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock trending products data
const trendingProducts = [
  {
    id: 1,
    name: "Handwoven Silk Scarf",
    price: 89.99,
    originalPrice: 119.99,
    image: "/images/products/silk-scarf.jpg",
    vendor: "Textile Traditions",
    category: "Fashion",
    link: "/products/handwoven-silk-scarf",
    isNew: true,
    rating: 4.8,
    reviewCount: 42,
    isFavorite: false
  },
  {
    id: 2,
    name: "Brass Table Lamp",
    price: 149.50,
    originalPrice: null,
    image: "/images/products/brass-lamp.jpg",
    vendor: "Metallic Wonders",
    category: "Home Decor",
    link: "/products/brass-table-lamp",
    isNew: false,
    rating: 4.9,
    reviewCount: 37,
    isFavorite: true
  },
  {
    id: 3,
    name: "Hand-painted Ceramic Platter",
    price: 65.00,
    originalPrice: 85.00,
    image: "/images/products/ceramic-platter.jpg",
    vendor: "Earthen Crafts",
    category: "Kitchen",
    link: "/products/hand-painted-ceramic-platter",
    isNew: false,
    rating: 4.7,
    reviewCount: 28,
    isFavorite: false
  },
  {
    id: 4,
    name: "Organic Cotton Throw Pillow",
    price: 42.99,
    originalPrice: null,
    image: "/images/products/cotton-pillow.jpg",
    vendor: "Eco Home",
    category: "Home Decor",
    link: "/products/organic-cotton-throw-pillow",
    isNew: true,
    rating: 4.6,
    reviewCount: 19,
    isFavorite: false
  },
  {
    id: 5,
    name: "Handcrafted Leather Journal",
    price: 38.50,
    originalPrice: 45.00,
    image: "/images/products/leather-journal.jpg",
    vendor: "Artisan Papers",
    category: "Stationery",
    link: "/products/handcrafted-leather-journal",
    isNew: false,
    rating: 4.9,
    reviewCount: 56,
    isFavorite: true
  },
  {
    id: 6,
    name: "Natural Beeswax Candles (Set of 3)",
    price: 32.00,
    originalPrice: null,
    image: "/images/products/beeswax-candles.jpg",
    vendor: "Pure Light",
    category: "Home Decor",
    link: "/products/natural-beeswax-candles",
    isNew: true,
    rating: 4.8,
    reviewCount: 31,
    isFavorite: false
  },
  {
    id: 7,
    name: "Hand-knotted Jute Rug",
    price: 199.00,
    originalPrice: 249.00,
    image: "/images/products/jute-rug.jpg",
    vendor: "Natural Flooring",
    category: "Home Decor",
    link: "/products/hand-knotted-jute-rug",
    isNew: false,
    rating: 4.7,
    reviewCount: 23,
    isFavorite: false
  },
  {
    id: 8,
    name: "Wooden Serving Board Set",
    price: 59.99,
    originalPrice: null,
    image: "/images/products/wooden-board.jpg",
    vendor: "Forest Crafters",
    category: "Kitchen",
    link: "/products/wooden-serving-board-set",
    isNew: false,
    rating: 4.8,
    reviewCount: 47,
    isFavorite: true
  }
];

export default function TrendingProducts() {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize favorites from the mock data
  useEffect(() => {
    setFavorites(trendingProducts.filter(p => p.isFavorite).map(p => p.id));
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
      container.addEventListener('scroll', checkScrollButtons);
      // Initial check
      checkScrollButtons();
      
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
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
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border ${canScrollLeft
              ? 'border-gray-200 hover:bg-gray-50 text-gray-700'
              : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border ${canScrollRight
              ? 'border-gray-200 hover:bg-gray-50 text-gray-700'
              : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}
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
          {trendingProducts.map((product) => (
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
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 280px, 320px"
                    />
                    
                    {/* Favorite button */}
                    <button 
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
                      aria-label={favorites.includes(product.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          favorites.includes(product.id) 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </button>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.isNew && (
                        <Badge className="bg-primary text-white px-2 py-1 text-xs">
                          New Arrival
                        </Badge>
                      )}
                      {product.originalPrice && (
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
                  <div className="text-xs text-primary/80 mb-1">{product.category}</div>
                  <Link href={product.link}>
                    <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 hover:text-primary transition-colors duration-200">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="text-xs text-gray-500 mb-2">{product.vendor}</div>
                  
                  {/* Price */}
                  <div className="flex items-center mb-3">
                    <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                  </div>
                  
                  {/* Add to cart button */}
                  <div className="mt-auto">
                    <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary rounded-full flex items-center justify-center gap-2 transition-colors">
                      <ShoppingBag className="h-4 w-4" />
                      Add to Cart
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
            href="/products/trending" 
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
