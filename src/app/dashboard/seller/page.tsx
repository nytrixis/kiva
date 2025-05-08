import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  AlertCircle,
  TrendingUp,
  Package,
  DollarSign
} from "lucide-react";

export const metadata = {
  title: "Seller Dashboard | Kiva",
  description: "Manage your seller account and products on Kiva",
};

export default async function SellerDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/seller");
  }
  
  if (session.user.role !== UserRole.SELLER) {
    redirect("/onboarding/seller");
  }
  
  // Fetch seller profile
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  
  if (!sellerProfile) {
    redirect("/onboarding/seller");
  }
  
  // Fetch seller stats
  const productsCount = await prisma.product.count({
    where: { sellerId: session.user.id },
  });
  
  // Get recent products
  const recentProducts = await prisma.product.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      category: true,
    },
  });
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 flex flex-wrap justify-center items-center opacity-5">
            {Array(10).fill(0).map((_, i) => (
              <div
                key={i}
                className="text-white font-heading text-8xl font-bold m-4 rotate-[-10deg]"
              >
                KIVA
              </div>
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold">Seller Dashboard</h1>
              <p className="text-white/80 mt-1">
                Welcome back, {session.user.name || "Seller"}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {sellerProfile.status === "PENDING" && (
                <div className="bg-yellow-400/20 text-yellow-100 px-4 py-2 rounded-full text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Verification Pending
                </div>
              )}
              
              {sellerProfile.status === "APPROVED" && (
                <div className="bg-green-400/20 text-green-100 px-4 py-2 rounded-full text-sm flex items-center">
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Seller
                </div>
              )}
              
              <Link 
                href="/dashboard/seller/products/new" 
                className="bg-white text-primary hover:bg-white/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add New Product
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{productsCount}</h3>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Add more products to increase visibility</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Views</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">0</h3>
              </div>
              <div className="h-12 w-12 bg-accent/30 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Start tracking from today</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">0</h3>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>No orders yet</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Revenue</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">₹0.00</h3>
              </div>
              <div className="h-12 w-12 bg-accent/30 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Start selling to generate revenue</span>
            </div>
          </div>
        </div>
        
        {/* Business profile summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-heading text-foreground">Business Profile</h2>
              <Link 
                href="/dashboard/seller/profile" 
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                Edit Profile
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 rounded-full bg-accent/30 flex items-center justify-center">
                  {sellerProfile.logoImage ? (
                    <Image 
                      src={sellerProfile.logoImage} 
                      alt={sellerProfile.businessName} 
                      width={96} 
                      height={96} 
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-heading text-primary">
                      {sellerProfile.businessName.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-foreground">{sellerProfile.businessName}</h3>
                <p className="text-gray-500 text-sm mt-1">{sellerProfile.businessType}</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-sm">{sellerProfile.phoneNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm">{sellerProfile.city}, {sellerProfile.state}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Categories</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sellerProfile.categories.map((category, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="text-sm">
                      {sellerProfile.website ? (
                        <a 
                          href={sellerProfile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {sellerProfile.website}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent products and quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent products */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-heading text-foreground">Recent Products</h2>
                <Link 
                  href="/dashboard/seller/products" 
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <div key={product.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 relative h-16 w-16 rounded-md overflow-hidden">
                      <Image 
                        src={Array.isArray(product.images) && product.images.length > 0 
                            ? String(product.images[0]) 
                            : "https://via.placeholder.com/64"
                        } 
                        alt={product.name} 
                        fill
                        style={{ objectFit: 'cover' }}
                        />

                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.category?.name} • ₹{product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {product.stock} • Views: {product.viewCount}
                        </p>
                      </div>
                      <div>
                        <Link 
                          href={`/dashboard/seller/products/${product.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No products yet</h3>
                  <p className="text-gray-500 mb-4">Start adding products to your store</p>
                    <Link 
                    href="/seller/products/new" 
                    className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-md"
                  >
                    Add Your First Product
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-heading text-foreground">Quick Actions</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <Link 
                  href="/dashboard/seller/products/new"
                  className="flex items-center p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Add New Product</h3>
                    <p className="text-xs text-gray-500">List a new item for sale</p>
                  </div>
                </Link>
                
                <Link 
                  href="/dashboard/seller/orders"
                  className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
                >
                  <div className="h-10 w-10 bg-accent/20 rounded-full flex items-center justify-center mr-4">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Manage Orders</h3>
                    <p className="text-xs text-gray-500">View and process customer orders</p>
                  </div>
                </Link>
                
                <Link 
                  href="/dashboard/seller/analytics"
                  className="flex items-center p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Analytics</h3>
                    <p className="text-xs text-gray-500">Track your store performance</p>
                  </div>
                </Link>
                
                <Link 
                  href="/dashboard/seller/profile"
                  className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
                >
                  <div className="h-10 w-10 bg-accent/20 rounded-full flex items-center justify-center mr-4">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Profile Settings</h3>
                    <p className="text-xs text-gray-500">Update your business information</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Verification status card - only show if not approved */}
        {sellerProfile.status !== "APPROVED" && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Verification Status</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {sellerProfile.status === "PENDING" && "Your documents are being reviewed by our team."}
                      {sellerProfile.status === "REJECTED" && "Your verification was rejected. Please update your documents."}
                      {sellerProfile.status === "SUSPENDED" && "Your account has been suspended. Please contact support."}
                    </p>
                  </div>
                </div>
                
                <div>
                  {sellerProfile.status === "PENDING" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Under Review
                    </span>
                  )}
                  
                  {sellerProfile.status === "REJECTED" && (
                    <Link 
                      href="/onboarding/seller/kyc"
                      className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-md"
                    >
                      Update Documents
                    </Link>
                  )}
                  
                  {sellerProfile.status === "SUSPENDED" && (
                    <Link 
                      href="/contact"
                      className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-md"
                    >
                      Contact Support
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tips for new sellers */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-heading text-foreground">Tips for Success</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">High-Quality Photos</h3>
                <p className="text-xs text-gray-500">Use clear, well-lit photos from multiple angles to showcase your products.</p>
              </div>
              
              <div className="p-4 bg-accent/10 rounded-lg">
                <div className="h-10 w-10 bg-accent/20 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">Detailed Descriptions</h3>
                <p className="text-xs text-gray-500">Write thorough descriptions with dimensions, materials, and usage instructions.</p>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">Competitive Pricing</h3>
                <p className="text-xs text-gray-500">Research the market to set prices that are attractive yet profitable.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
