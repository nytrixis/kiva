"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  Check,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage: number;
  stock: number;
  viewCount: number;
  reviewCount: number;
  rating: number;
  images: string[] | any;
  createdAt: Date;
  category: {
    name: string;
  };
}

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products: initialProducts }: ProductsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Product>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort products based on sort field and direction
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortField === "name" || sortField === "category") {
      const aValue = sortField === "category" ? a.category.name.toLowerCase() : a.name.toLowerCase();
      const bValue = sortField === "category" ? b.category.name.toLowerCase() : b.name.toLowerCase();
      
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      return sortDirection === "asc"
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    }
  });
  
  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      setIsDeleting(productId);
      
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          throw new Error("Failed to delete product");
        }
        
        // Remove product from state
        setProducts((prev) => prev.filter((product) => product.id !== productId));
        
        toast({
          title: "Product Deleted",
          description: "The product has been successfully deleted.",
          variant: "success",
          icon: <Check className="h-4 w-4" />,
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4" />,
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Search and filters */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      </div>
      
      {/* Products table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortField === "category" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center">
                  Price
                  {sortField === "price" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("stock")}
              >
                <div className="flex items-center">
                  Stock
                  {sortField === "stock" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("viewCount")}
              >
                <div className="flex items-center">
                  Views
                  {sortField === "viewCount" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 relative rounded overflow-hidden">
                      <Image
                        src={Array.isArray(product.images) && product.images.length > 0
                          ? product.images[0]
                          : "/images/placeholder-product.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.rating.toFixed(1)} ★ ({product.reviewCount})
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">₹{product.price.toFixed(2)}</div>
                  {product.discountPercentage > 0 && (
                    <div className="text-xs text-green-600">{product.discountPercentage}% off</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {product.stock}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.viewCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-gray-600 hover:text-gray-900"
                      target="_blank"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/dashboard/seller/products/${product.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={isDeleting === product.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                                            {isDeleting === product.id ? (
                        <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
