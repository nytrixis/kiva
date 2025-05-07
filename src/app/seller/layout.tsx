import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Home,
  ChevronRight
} from "lucide-react";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated and is a seller
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/signin?callbackUrl=/seller");
  }
  
  if (session.user.role !== "SELLER") {
    redirect("/access-denied?message=You need a seller account to access this page");
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Seller dashboard header */}
      <div className="bg-primary text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-heading font-bold">Seller Dashboard</h1>
            <Link href="/" className="text-white/80 hover:text-white text-sm flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Back to Store
            </Link>
          </div>
        </div>
      </div>
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/seller" className="hover:text-primary">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-900 font-medium">Products</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar navigation */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-1">
                <Link
                  href="/seller"
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-lg transition-colors"
                >
                  <BarChart3 className="h-5 w-5 mr-3 text-gray-500" />
                  Dashboard
                </Link>
                <Link
                  href="/seller/products"
                  className="flex items-center px-3 py-2 bg-primary/10 text-primary font-medium rounded-lg transition-colors"
                >
                  <Package className="h-5 w-5 mr-3" />
                  Products
                </Link>
                <Link
                  href="/seller/orders"
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-lg transition-colors"
                >
                  <ShoppingBag className="h-5 w-5 mr-3 text-gray-500" />
                  Orders
                </Link>
                <Link
                  href="/seller/settings"
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5 mr-3 text-gray-500" />
                  Settings
                </Link>
              </nav>
            </div>
            
            {/* Quick stats */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Total Products</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Pending Orders</span>
                  <span className="text-sm font-medium">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">This Month Sales</span>
                  <span className="text-sm font-medium">₹24,500</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
