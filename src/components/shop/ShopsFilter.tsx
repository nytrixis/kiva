"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Star, Filter, X } from "lucide-react";
import { motion } from "framer-motion";

interface ShopsFilterProps {
  selectedCategories: string[];
  minRating?: number;
  categoryOptions: string[];
}

export default function ShopsFilter({ 
  selectedCategories, 
  minRating, 
  categoryOptions 
}: ShopsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [categories, setCategories] = useState<string[]>(selectedCategories);
  const [rating, setRating] = useState<number | undefined>(minRating);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Apply filters when they change
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Add categories
    categories.forEach(category => {
      params.append('categories', category);
    });
    
    // Add rating
    if (rating) {
      params.set('minRating', rating.toString());
    }
    
    // Update URL with filters
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  }, [categories, rating, pathname, router]);
  
  const handleCategoryChange = (category: string) => {
    setCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handleRatingChange = (newRating: number) => {
    setRating(rating === newRating ? undefined : newRating);
  };
  
  const clearFilters = () => {
    setCategories([]);
    setRating(undefined);
  };
  
  const hasActiveFilters = categories.length > 0 || rating !== undefined;
  
  return (
    <>
      {/* Mobile filter button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-100"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
              {categories.length + (rating ? 1 : 0)}
            </span>
          )}
        </button>
      </div>
      
      {/* Mobile filter drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto"
          >
            <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h3 className="font-medium">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {renderFilterContent()}
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Desktop filters */}
      <div className="hidden md:block sticky top-24">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Filters</h3>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-xs text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="p-4">
            {renderFilterContent()}
          </div>
        </div>
      </div>
    </>
  );
  
  function renderFilterContent() {
    return (
      <div className="space-y-6">
        {/* Categories filter */}
        <div>
          <h4 className="font-medium mb-3">Categories</h4>
          <div className="space-y-2">
            {categoryOptions.map((category) => (
              <div key={category} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  checked={categories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label 
                  htmlFor={`category-${category}`} 
                  className="ml-2 text-sm text-gray-700 cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Rating filter */}
        <div>
          <h4 className="font-medium mb-3">Rating</h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((star) => (
              <div 
                key={star}
                onClick={() => handleRatingChange(star)}
                className="flex items-center cursor-pointer group"
              >
                <div className={`p-1 rounded ${rating === star ? 'bg-primary/10' : 'hover:bg-gray-100'}`}>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < star 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-700">
                      {star}+ stars
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
