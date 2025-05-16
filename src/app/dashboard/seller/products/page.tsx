import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductsTable } from "@/components/dashboard/seller/ProductsTable";

export const metadata = {
  title: "Manage Products | Seller Dashboard | Kiva",
  description: "Manage your products in the Kiva marketplace",
};

interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage: number;
  stock: number;
  images: string[] | Record<string, unknown>;
  createdAt: Date; // <-- Fix type here
  viewCount: number;
  reviewCount: number;
  rating: number;
  category: {
    name: string;
  };
}

export default async function SellerProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    // Optionally redirect to sign-in if not authenticated
    return null;
  }

  // Fetch seller's products from your REST API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/seller/products`, {
    cache: "no-store",
  });

  const products: Product[] = res.ok
    ? (await res.json()).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt), // <-- Convert to Date
      }))
    : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-heading text-primary mb-2">Products</h1>
          <p className="text-gray-600">
            Manage your product listings in the marketplace
          </p>
        </div>

        <Link
          href="/dashboard/seller/products/new"
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Link>
      </div>

      {products.length > 0 ? (
        <ProductsTable products={products} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="inline-flex items-center justify-center p-6 bg-gray-50 rounded-full mb-6">
            <svg
              className="h-10 w-10 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">No products yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Start adding products to your store to begin selling on Kiva marketplace.
          </p>
          <Link
            href="/dashboard/seller/products/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Product
          </Link>
        </div>
      )}
    </div>
  );
}