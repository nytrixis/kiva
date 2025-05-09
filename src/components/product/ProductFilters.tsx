"use client";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Star } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

type FilterValue = string | number | null | undefined;

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  
  onFilterChange: (filters: { [key: string]: any }) => void;
}

export default function ProductFilters({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  onFilterChange,
}: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState([
    minPrice ? parseInt(minPrice) : 0,
    maxPrice ? parseInt(maxPrice) : 10000,
  ]);
 
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    ratings: true,
  });
 
  // Update price range when props change
  useEffect(() => {
    setPriceRange([
      minPrice ? parseInt(minPrice) : 0,
      maxPrice ? parseInt(maxPrice) : 10000,
    ]);
  }, [minPrice, maxPrice]);
 
  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };
 
  const handlePriceChangeEnd = (values: number[]) => {
    onFilterChange({
      minPrice: values[0],
      maxPrice: values[1],
    });
  };
 
  const handleCategoryChange = (categoryId: string) => {
    onFilterChange({
      category: categoryId === selectedCategory ? null : categoryId,
    });
  };
 
  const toggleSection = (section: 'categories' | 'price' | 'ratings') => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  }; 
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <h3 className="text-base font-medium">Categories</h3>
          <span className={`transform transition-transform ${expandedSections.categories ? "rotate-0" : "rotate-90"}`}>
            <Minus className="h-4 w-4" />
          </span>
        </button>
        
        {expandedSections.categories && (
          <div className="space-y-2 mt-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategory === category.id}
                  onCheckedChange={() => handleCategoryChange(category.id)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Price Range */}
      <div>
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <h3 className="text-base font-medium">Price Range</h3>
          <span className={`transform transition-transform ${expandedSections.price ? "rotate-0" : "rotate-90"}`}>
            <Minus className="h-4 w-4" />
          </span>
        </button>
        
        {expandedSections.price && (
          <div className="mt-3">
            <div className="mb-4">
              <Slider
                value={priceRange}
                min={0}
                max={10000}
                step={100}
                onValueChange={handlePriceChange}
                onValueCommit={handlePriceChangeEnd}
                className="my-6"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="px-3 py-1 bg-gray-100 rounded-md">
                <span className="text-xs text-gray-800">₹{priceRange[0]}</span>
              </div>
              <div className="px-3 py-1 bg-gray-100 rounded-md">
                <span className="text-xs text-gray-800">₹{priceRange[1]}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Ratings */}
      <div>
        <button
          onClick={() => toggleSection("ratings")}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <h3 className="text-base font-medium">Ratings</h3>
          <span className={`transform transition-transform ${expandedSections.ratings ? "rotate-0" : "rotate-90"}`}>
            <Minus className="h-4 w-4" />
          </span>
        </button>
        
        {expandedSections.ratings && (
          <div className="space-y-2 mt-3">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <Checkbox
                  id={`rating-${rating}`}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor={`rating-${rating}`}
                  className="text-sm text-gray-700 cursor-pointer flex items-center"
                >
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < rating ? "fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="ml-1">& Up</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
