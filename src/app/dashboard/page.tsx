"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
// import type { AuthUser } from "@/hooks/use-auth";
import {
  ShoppingBag,
  Heart,
  User,
  Settings,
  LogOut,
  Bell,
  Package,
  Clock,
  ChevronRight,
  Star,
  Calendar,
  MapPin,
  
} from "lucide-react";
// import { UserRole } from "@prisma/client";

// Define types based on Prisma schema
// interface UserWithProfile {
//   id: string;
//   name?: string | null;
//   email?: string | null;
//   emailVerified?: Date | null;
//   password?: string | null;
//   image?: string | null;
//   role: UserRole;
//   createdAt?: Date;
//   updatedAt?: Date;
//   isOnboarded: boolean;
//   bio?: string | null;
//   phone?: string | null;
//   location?: string | null;
// }

interface UserPreferences {
  id: string;
  userId: string;
  categories: string[];
  notifications: boolean;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data for recently viewed products
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  vendor?: string;
  rating?: number;
}

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
}

const recentlyViewed: Product[] = [
  {
    id: 1,
    name: "Handcrafted Ceramic Mug",
    price: 24.99,
    image: "/images/products/ceramic-mug.png",
  },
  {
    id: 2,
    name: "Indigo Dyed Cotton Scarf",
    price: 35.00,
    image: "/images/products/cotton-scarf.png",
  },
  {
    id: 3,
    name: "Wooden Serving Board",
    price: 42.50,
    image: "/images/products/wooden-board.png",
  },
];

// Mock data for recommended products
const recommended: Product[] = [
  {
    id: 4,
    name: "Lavender Essential Oil",
    price: 18.99,
    image: "/images/products/lavender-oil.png",
    vendor: "Natural Essence",
    rating: 4.8
  },
  {
    id: 5,
    name: "Handwoven Wall Hanging",
    price: 89.00,
    image: "/images/products/wall-hanging.png",
    vendor: "Fiber Arts Collective",
    rating: 4.9
  },
  {
    id: 6,
    name: "Artisanal Honey Set",
    price: 32.00,
    image: "/images/products/honey-jar.png",
    vendor: "Wild Bee Farms",
    rating: 4.7
  },
];

// Define an Order interface
interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  // Add other properties as needed
}

// Mock data for orders
const orders: Order[] = [];
// Mock data for upcoming events
const upcomingEvents: Event[] = [
  {
    id: 1,
    title: "Artisan Market",
    date: "June 15, 2023",
    location: "City Center Plaza",
    image: "/images/events/market.png"
  },
  {
    id: 2,
    title: "Craft Workshop",
    date: "June 22, 2023",
    location: "Community Center",
    image: "/images/events/workshop.png"
  }
];

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in");
    }
  }, [isLoading, user, router]);
  
  // Fetch user preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await fetch("/api/user/preferences");
        if (response.ok) {
          const data = await response.json();
          setUserPreferences(data.preferences);
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };
    
    if (user) {
      fetchUserPreferences();
    }
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-10 overflow-hidden border border-[#E6E6FA]">
                <Image
                  src="/images/logob.png"
                  alt="Kiva Logo"
                  fill
                  className="object-cover"
                  sizes="40px"
                  priority
                />
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-primary transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                  {user.name?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-medium hidden md:block">
                  {user.name || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "overview"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Overview</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "orders"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span>Orders</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "wishlist"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  <span>Wishlist</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("history")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "history"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Clock className="h-5 w-5" />
                  <span>Recently Viewed</span>
                </button>
                
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "settings"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Welcome Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary">
                  <h1 className="text-2xl font-heading font-bold mb-2">
                    Welcome back, {user.name}!
                  </h1>
                  <p className="text-gray-600">
                    Here&apos;s what&apos;s happening with your account today.
                  </p>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Orders</p>
                        <h3 className="text-2xl font-bold">0</h3>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Wishlist Items</p>
                        <h3 className="text-2xl font-bold">0</h3>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Recently Viewed</p>
                        <h3 className="text-2xl font-bold">{recentlyViewed.length}</h3>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recently Viewed */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium">Recently Viewed</h2>
                    <button
                      onClick={() => setActiveTab("history")}
                      className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center"
                    >
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recentlyViewed.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="group"
                      >
                        <Link href={`/products/${product.id}`} className="block">
                          <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <div className="relative h-48 w-full">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-primary font-bold mt-1">
                                ${product.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Recommended Products */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium">Recommended For You</h2>
                    <Link
                      href="/recommendations"
                      className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center"
                    >
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommended.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="group"
                      >
                        <Link href={`/products/${product.id}`} className="block">
                          <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <div className="relative h-48 w-full">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                            </div>
                            <div className="p-4">
                              <p className="text-xs text-gray-500 mb-1">{product.vendor}</p>
                              <h3 className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-primary font-bold">
                                  ${product.price.toFixed(2)}
                                </p>
                                <div className="flex items-center text-amber-500">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span className="text-xs ml-1">{product.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Upcoming Events */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium">Upcoming Events</h2>
                    <Link
                      href="/events"
                      className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center"
                    >
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <Link href={`/events/${event.id}`} className="block group">
                          <div className="flex bg-gray-50 rounded-lg overflow-hidden">
                            <div className="relative h-24 w-24 shrink-0">
                              <Image
                                src={event.image}
                                alt={event.title}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                                {event.title}
                              </h3>
                              <div className="flex items-center text-gray-500 text-sm mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center text-gray-500 text-sm mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-medium mb-6">Your Orders</h2>
                  
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          {/* Order details would go here */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No orders yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        When you place your first order, it will appear here for you to track.
                      </p>
                      <Link
                        href="/collections"
                        className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-medium mb-6">Your Wishlist</h2>
                  
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Save items you love to your wishlist. Review them anytime and easily move them to your cart.
                    </p>
                    <Link
                      href="/collections"
                      className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Discover Products
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recently Viewed Tab */}
            {activeTab === "history" && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-medium mb-6">Recently Viewed Products</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recentlyViewed.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="group"
                      >
                        <Link href={`/products/${product.id}`} className="block">
                          <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <div className="relative h-48 w-full">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-primary font-bold mt-1">
                                ${product.price.toFixed(2)}
                              </p>
                              <div className="flex justify-between items-center mt-3">
                                <button className="text-xs text-primary hover:text-primary/80 transition-colors">
                                  Add to cart
                                </button>
                                <button className="text-gray-400 hover:text-red-500 transition-colors">
                                  <Heart className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-medium mb-6">Account Settings</h2>
                  
                  <div className="space-y-8">
                    {/* Profile Information */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            defaultValue={user.name || ""}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            defaultValue={user.email || ""}
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            defaultValue={(user as ExtendedUser)?.phone ?? ""}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            defaultValue={(user as ExtendedUser)?.location ?? ""}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Preferences */}
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-medium mb-4">Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-sm text-gray-500">
                              Receive updates about your account, orders, and promotions
                            </p>
                          </div>
                          <div className="w-12 h-6 rounded-full bg-primary relative">
                            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white"></span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">SMS Notifications</h4>
                            <p className="text-sm text-gray-500">
                              Receive text messages for order updates and promotions
                            </p>
                          </div>
                          <div className="w-12 h-6 rounded-full bg-gray-300 relative">
                            <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Security */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Security</h3>
                      <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        Change Password
                      </button>
                    </div>
                    
                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
