"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilters from "@/components/product/ProductFilters";
import ProductSort from "@/components/product/ProductSort";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

// interface Seller {
//   name: string;
// }

interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage: number;
  images: string[];
  rating: number;
  reviewCount: number;
  category: {
    name: string;
  };
  seller: {
    name: string;
  };
  stock?: number;
  isInWishlist?: boolean;
}

interface ProductCatalogProps {
  categories: Category[];
  initialCategory?: string | null;
  searchQuery?: string | null;
}

export default function ProductCatalog({
  categories,
  initialCategory = null,
  searchQuery = null
}: ProductCatalogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
 
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeFilters, setActiveFilters] = useState(0);
 
  // Get current filter values from URL
  const categoryParam = searchParams.get("category") || initialCategory;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sortBy = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
 
  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (categoryParam) params.append("category", categoryParam);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (sortBy) params.append("sort", sortBy);
        if (page) params.append("page", page.toString());
        if (searchQuery) params.append("q", searchQuery);
        
        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();
        
        setProducts(data.products);
        setTotalProducts(data.total);
        
        // Count active filters
        let filterCount = 0;
        if (categoryParam) filterCount++;
        if (minPrice || maxPrice) filterCount++;
        if (sortBy !== "newest") filterCount++;
        setActiveFilters(filterCount);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [categoryParam, minPrice, maxPrice, sortBy, page, searchQuery]);
 
  // Update URL with filters
  const updateFilters = (filters: { [key: string]: any }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update params based on filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change
    if (filters.category !== undefined ||
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined ||
        filters.sort !== undefined) {
      params.set("page", "1");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };
 
  // Clear all filters
  const clearFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    router.push(`${pathname}?${params.toString()}`);
  };
 
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Mobile filter button */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilters > 0 && (
            <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
        
        <ProductSort
          value={sortBy}
          onChange={(value) => updateFilters({ sort: value })}
        />
      </div>
      
      {/* Mobile filters drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="absolute top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <ProductFilters
              categories={categories}
              selectedCategory={categoryParam}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onFilterChange={updateFilters}
            />
            
            <div className="mt-8 flex space-x-4">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Desktop filters sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Filters</h2>
            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          <ProductFilters
            categories={categories}
            selectedCategory={categoryParam}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onFilterChange={updateFilters}
          />
        </div>
      </div>
      
      {/* Products grid */}
      <div className="flex-1">
        <div className="hidden md:flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500">
              Showing <span className="font-medium text-gray-900">{products.length}</span> of{" "}
              <span className="font-medium text-gray-900">{totalProducts}</span> products
            </p>
          </div>
          
          <ProductSort
            value={sortBy}
            onChange={(value) => updateFilters({ sort: value })}
          />
        </div>
        
        <ProductGrid
          products={products}
          loading={loading}
        />
        
        {/* Pagination */}
        {totalProducts > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => updateFilters({ page: page - 1 })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.ceil(totalProducts / 12) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => updateFilters({ page: i + 1 })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    page === i + 1
                      ? "bg-primary text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              )).slice(Math.max(0, page - 3), Math.min(Math.ceil(totalProducts / 12), page + 2))}
              
              <button
                disabled={page >= Math.ceil(totalProducts / 12)}
                onClick={() => updateFilters({ page: page + 1 })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
