import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  Star
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Category {
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | string;
  rating: number;
  viewCount: number;
  reviewCount: number;
  category?: Category;
}

export default async function SellerDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Fetch seller profile
  const { data: sellerProfile } = await supabase
    .from("seller_profile")
    .select(
      "*,user:user(id,name,email,image,createdAt)"
    )
    .eq("userId", userId)
    .single();

  // Fetch top 5 products by sales/views
  const { data: topProducts = [] } = await supabase
    .from("product")
    .select("*,category:category(*),seller:user(id,name)")
    .eq("sellerId", userId)
    .order("viewCount", { ascending: false })
    .order("reviewCount", { ascending: false })
    .limit(5);

  // Calculate total products
  const { count: totalProducts = 0 } = await supabase
    .from("product")
    .select("id", { count: "exact", head: true })
    .eq("sellerId", userId);

  return (
    <div>
      <h1 className="text-3xl font-heading text-primary mb-6">Seller Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Products</p>
              <h3 className="text-2xl font-semibold">{totalProducts}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-accent/30 rounded-full">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-semibold">0</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Revenue</p>
              <h3 className="text-2xl font-semibold">₹0.00</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <h3 className="text-2xl font-semibold">0%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0">
            <Image
              src={sellerProfile?.logoImage || "/images/placeholder-user.jpg"}
              alt={sellerProfile?.businessName || "Seller"}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>

          <div className="md:ml-6">
            <h2 className="text-2xl font-heading text-gray-800">
              {sellerProfile?.businessName || "Your Business"}
            </h2>
            <p className="text-gray-600 mb-2">
              {sellerProfile?.businessType || "Individual Seller"}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {sellerProfile?.categories?.map((category: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-accent/30 text-primary text-xs rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 md:mt-0 md:ml-auto">
            <Link
              href="/dashboard/seller/profile"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">
              {sellerProfile?.city}, {sellerProfile?.state}, {sellerProfile?.country}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium">
              {sellerProfile?.user?.createdAt
                ? format(new Date(sellerProfile.user.createdAt), "MMMM yyyy")
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Verification Status</p>
            <p className={`font-medium ${
              sellerProfile?.status === "APPROVED"
                ? "text-green-600"
                : sellerProfile?.status === "PENDING"
                ? "text-yellow-600"
                : "text-red-600"
            }`}>
              {sellerProfile?.status || "INCOMPLETE"}
            </p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-heading text-lg">Top Products</h3>
          <Link
            href="/dashboard/seller/products"
            className="text-sm text-primary hover:underline"
          >
            View All
          </Link>
        </div>

        {(topProducts ?? []).length > 0 ? (
          <div className="divide-y divide-gray-100">
            {(topProducts ?? []).map((product: Product) => (
              <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={(Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string')
                        ? product.images[0]
                        : "/images/placeholder-product.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="ml-4 flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-500">
                      {product.category?.name} • ₹{product.price?.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end mb-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{Number(product.rating ?? 0).toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {product.viewCount} views • {product.reviewCount} reviews
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full mb-4">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-4">
              Start adding products to your store to see them here
            </p>
            <Link
              href="/seller/products/new"
              className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add Product
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-heading text-lg mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/seller/products/new"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Package className="h-5 w-5 text-primary mr-3" />
              <span>Add New Product</span>
            </Link>

            <Link
              href="/dashboard/seller/profile"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users className="h-5 w-5 text-primary mr-3" />
              <span>Update Profile</span>
            </Link>

            <Link
              href="/dashboard/seller/orders"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingBag className="h-5 w-5 text-primary mr-3" />
              <span>View Orders</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
          <h3 className="font-heading text-lg mb-4">Store Status</h3>

          {sellerProfile?.status === "APPROVED" ? (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Your store is active</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your store is verified and visible to customers. You can add products and receive orders.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : sellerProfile?.status === "PENDING" ? (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Verification pending</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Your store is under review. This usually takes 1-3 business days. You can still add products, but they will not be visible to customers until your store is approved.</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/dashboard/seller/kyc"
                      className="text-sm font-medium text-yellow-800 hover:text-yellow-700"
                    >
                      Check verification status →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Verification required</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Your store needs to be verified before you can start selling. Please complete the verification process.</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/dashboard/seller/kyc"
                      className="text-sm font-medium text-red-800 hover:text-red-700"
                    >
                      Complete verification →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}