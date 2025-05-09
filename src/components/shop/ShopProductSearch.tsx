"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShopProductSearchProps {
  initialQuery: string;
  shopId: string;
}

export default function ShopProductSearch({ initialQuery, shopId }: ShopProductSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shops/${shopId}?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/shops/${shopId}`);
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setQuery("");
    router.push(`/shops/${shopId}`);
  };
  
  return (
    <div>
      <form onSubmit={handleSearch} className="relative">
        <div className={`flex items-center bg-gray-50 rounded-lg transition-all duration-300 ${
          isFocused ? 'ring-2 ring-primary/30' : ''
        }`}>
          <input
            type="text"
            placeholder="Search products in this shop..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="py-3 pl-4 pr-10 w-full bg-transparent outline-none text-sm text-foreground placeholder:text-gray-400 rounded-lg"
          />
          
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={clearSearch}
                className="absolute right-12 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
          
          <button 
            type="submit" 
            className="p-3 text-primary hover:text-primary/80 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>
      
      {/* Quick search suggestions */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Popular searches:</p>
        <div className="flex flex-wrap gap-2">
          {['New Arrivals', 'Bestsellers', 'Sale', 'Handmade'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                router.push(`/shops/${shopId}?q=${encodeURIComponent(term)}`);
              }}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
      
      {/* Search tips */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">Search tips:</p>
        <ul className="mt-1 text-xs text-gray-500 space-y-1 list-disc pl-4">
          <li>Use specific product names</li>
          <li>Try searching by material or color</li>
          <li>Include category names in your search</li>
        </ul>
      </div>
    </div>
  );
}
