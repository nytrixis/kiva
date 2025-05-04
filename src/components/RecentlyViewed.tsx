"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

// Mock recently viewed products data
// In a real app, this would come from localStorage or user session
const recentlyViewedProducts = [
  {
    id: 1,
    name: "Handcrafted Ceramic Mug",
    price: 24.99,
    image: "/images/products/ceramic-mug.png",
    vendor: "Earthen Crafts",
    category: "Home Decor",
    link: "/products/handcrafted-ceramic-mug"
  },
  {
    id: 2,
    name: "Indigo Dyed Cotton Scarf",
    price: 35.00,
    image: "/images/products/cotton-scarf.jpg",
    vendor: "Textile Traditions",
    category: "Fashion",
    link: "/products/indigo-cotton-scarf"
  },
  {
    id: 3,
    name: "Wooden Serving Board",
    price: 42.50,
    image: "/images/products/wooden-board.jpg",
    vendor: "Forest Crafters",
    category: "Kitchen",
    link: "/products/wooden-serving-board"
  },
  {
    id: 4,
    name: "Lavender Essential Oil",
    price: 18.99,
    image: "/images/products/lavender-oil.jpg",
    vendor: "Natural Essence",
    category: "Wellness",
    link: "/products/lavender-essential-oil"
  },
  {
    id: 5,
    name: "Handwoven Wall Hanging",
    price: 89.00,
    image: "/images/products/wall-hanging.jpg",
    vendor: "Fiber Arts Collective",
    category: "Home Decor",
    link: "/products/handwoven-wall-hanging"
  },
  {
    id: 6,
    name: "Artisanal Honey Set",
    price: 32.00,
    image: "/images/products/honey-set.jpg",
    vendor: "Wild Bee Farms",
    category: "Foods",
    link: "/products/artisanal-honey-set"
  }
];

export default function RecentlyViewed() {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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
      const scrollAmount = direction === 'left' ? -300 : 300;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // If no recently viewed products, don't render the section
  if (recentlyViewedProducts.length === 0) return null;

  return (
    <section className="py-12 relative overflow-hidden bg-background">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-1/4 h-1/2 bg-accent/5 rounded-bl-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-1/5 h-1/3 bg-primary/5 rounded-tr-[80px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
            Recently <span className="text-primary">Viewed</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Continue exploring products you've viewed and discover more items you'll love
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
        
        {/* Scrollable product container */}
        <div
          ref={containerRef}
          className="flex overflow-x-auto pb-4 hide-scrollbar gap-4 snap-x snap-mandatory"
        >
          {recentlyViewedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4 }}
              className="min-w-[240px] sm:min-w-[280px] snap-start"
            >
              <Link href={product.link} className="block group">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  {/* Product image */}
                  <div className="relative h-[180px] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 240px, 280px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Product info */}
                  <div className="p-4">
                    <div className="text-xs text-primary/80 mb-1">{product.category}</div>
                    <h3 className="font-medium text-gray-800 mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-200">
                      {product.name}
                    </h3>
                    <div className="text-xs text-gray-500 mb-2">{product.vendor}</div>
                    <div className="font-semibold text-gray-900">${product.price.toFixed(2)}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* View all link */}
        <div className="mt-6 text-center">
          <Link
            href="/account/history"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all recently viewed products
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
