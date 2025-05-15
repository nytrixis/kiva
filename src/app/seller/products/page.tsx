import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Plus, Package } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "My Products | Seller Dashboard",
  description: "Manage your products on Kiva",
};

export default async function SellerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const { page: pageParam, limit: limitParam } = await searchParams;

  // Check if user is authenticated and is a seller
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin?callbackUrl=/seller/products");
  }

  if (session.user.role !== "SELLER") {
    redirect("/access-denied?message=You need a seller account to access this page");
  }
  
  // Pagination
  const page = parseInt(pageParam || "1");
  const limit = parseInt(limitParam || "10");
  const skip = (page - 1) * limit;

  // Fetch seller's products
  const products = await prisma.product.findMany({
    where: {
      sellerId: session.user.id,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });
  
  // Get total count for pagination
  const total = await prisma.product.count({
    where: {
      sellerId: session.user.id,
    },
  });
  
  const totalPages = Math.ceil(total / limit);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">My Products</h1>
          <p className="text-gray-600 mt-1">Manage your product listings</p>
        </div>
        
        <Link
          href="/seller/products/new"
          className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Link>
      </div>
      
      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No products yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            You haven&apos;t added any products yet. Start selling by creating your first product listing.
          </p>
          <Link
            href="/seller/products/new"
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Product
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => {
                    // Calculate discounted price
                    const discountedPrice = product.discountPercentage > 0
                      ? product.price * (1 - product.discountPercentage / 100)
                      : null;
                    
                    // Get first image and ensure it's a string
                    const imageUrl = Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string'
                      ? product.images[0]
                      : "/images/placeholder-product.jpg";
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              <div className="relative h-10 w-10 rounded overflow-hidden">
                                <Image
                                  src={imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {product.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{discountedPrice ? discountedPrice.toFixed(2) : product.price.toFixed(2)}
                          </div>
                          {discountedPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{product.price.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.stock} units
                          </div>
                          {product.stock < 5 && (
                            <div className="text-xs text-amber-600">
                              Low stock
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.category.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={`/products/${product.id}`}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              View
                            </Link>
                            <Link
                              href={`/seller/products/edit/${product.id}`}
                              className="text-primary hover:text-primary/80"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <Link
                  href={`/seller/products?page=${Math.max(1, page - 1)}&limit=${limit}`}
                  className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${
                    page === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Previous
                </Link>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around the current page
                  let pageNum = page;
                  if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  // Ensure page number is within valid range
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  
                  return (
                    <Link
                      key={pageNum}
                      href={`/seller/products?page=${pageNum}&limit=${limit}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                        page === pageNum
                          ? "bg-primary text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
                
                <Link
                  href={`/seller/products?page=${Math.min(totalPages, page + 1)}&limit=${limit}`}
                  className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${
                    page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
