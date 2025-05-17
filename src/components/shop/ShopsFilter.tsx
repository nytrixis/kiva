"use client";

import { Star, Filter, X } from "lucide-react";
import { motion } from "framer-motion";

interface ShopsFilterProps {
  selectedCategories: string[];
  minRating?: number;
  categoryOptions: string[];
  onFilterChange: (filters: { categories?: string[]; minRating?: number }) => void;
}

export default function ShopsFilter({
  selectedCategories,
  minRating,
  categoryOptions,
  onFilterChange,
}: ShopsFilterProps) {
  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onFilterChange({ categories: newCategories, minRating });
  };

  const handleRatingChange = (newRating: number) => {
    onFilterChange({ categories: selectedCategories, minRating: minRating === newRating ? undefined : newRating });
  };

  const clearFilters = () => {
    onFilterChange({ categories: [], minRating: undefined });
  };

  const hasActiveFilters = selectedCategories.length > 0 || minRating !== undefined;

  return (
    <>
      {/* Mobile filter button */}
      <div className="md:hidden mb-4">
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-100"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
              {selectedCategories.length + (minRating ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

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
            {/* Categories filter */}
            <div>
              <h4 className="font-medium mb-3">Categories</h4>
              <div className="space-y-2">
                {categoryOptions.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
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
            <div className="mt-6">
              <h4 className="font-medium mb-3">Rating</h4>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((star) => (
                  <div
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className="flex items-center cursor-pointer group"
                  >
                    <div className={`p-1 rounded ${minRating === star ? 'bg-primary/10' : 'hover:bg-gray-100'}`}>
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
        </div>
      </div>
    </>
  );
}