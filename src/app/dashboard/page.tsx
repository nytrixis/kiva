"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import AddToCartButton from "@/components/product/AddToCartButton";
import AddToWishlistButton from "@/components/product/AddToWishlistButton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  User,
  Settings,
  LogOut,
  Package,
  Clock,
  ChevronRight,
  Star,
  Calendar,
  MapPin,
} from "lucide-react";

interface UserPreferences {
  id: string;
  userId: string;
  categories: string[];
  notifications: boolean;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  discountPrice?: number;
  discountPercentage?: number;
  category?: { id: string; name: string };
  seller?: { id: string; name: string };
  rating?: number;
  stock?: number;
}

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
}

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  discountPercentage?: number;
  image?: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  paidAt?: string;
  items: OrderItem[];
}

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
}

interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
}

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);


  // Data states
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentlyViewedLoading, setRecentlyViewedLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [recommendedLoading, setRecommendedLoading] = useState(false);

  // ...existing code...

function RecentlyViewedProductCard({ product }: { product: Product }) {
  const salePrice = product.discountPrice ?? product.price;
  const hasSignificantDiscount = (product.discountPercentage ?? 0) > 40;
  const productImages = Array.isArray(product.images) ? product.images : [];

  return (
    <div key={product.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-stretch">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-4">
          <ProductImageGallery images={productImages} productName={product.name} />
        </div>
      </Link>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/categories/${product.category?.id}`} className="text-xs text-primary hover:underline">
            {product.category?.name || "Uncategorized"}
          </Link>
          <Link href={`/products/${product.id}`}>
            <h2 className="text-lg font-bold text-gray-900 mt-1 hover:text-primary transition-colors">
              {product.name}
            </h2>
          </Link>
          <div className="text-xs text-gray-500 mb-2">
            Sold by{" "}
            <Link href={`/sellers/${product.seller?.id}`} className="text-primary hover:underline">
              {product.seller?.name || "Unknown Seller"}
            </Link>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            {product.discountPercentage && product.discountPercentage > 0 ? (
              <>
                <span className="text-base font-bold text-gray-900">
                  ₹{salePrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
                <Badge className={`${hasSignificantDiscount ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} px-2 py-1`}>
                  {Math.round(product.discountPercentage)}% OFF
                </Badge>
              </>
            ) : (
              <span className="text-base font-bold text-gray-900">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="mt-3">
          <AddToCartButton productId={product.id} stock={product.stock ?? 1} />
        </div>
      </div>
    </div>
  );
}


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
    if (user) fetchUserPreferences();
  }, [user]);

  // Fetch wishlist
  useEffect(() => {
  if (!user) return;
  setWishlistLoading(true);
  fetch("/api/wishlist")
    .then(res => res.json())
    .then(data => setWishlist(data.items || []))
    .catch(() => setWishlist([]))
    .finally(() => setWishlistLoading(false));
}, [user]);


  // Fetch recently viewed
  useEffect(() => {
    if (!user) return;
    setRecentlyViewedLoading(true);
    fetch("/api/recently-viewed")
      .then(res => res.json())
      .then(data => setRecentlyViewed(data.products || []))
      .catch(() => setRecentlyViewed([]))
      .finally(() => setRecentlyViewedLoading(false));
  }, [user]);

  // Fetch orders
  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    fetch("/api/user/orders")
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  // Fetch recommended products based on user preferences
  useEffect(() => {
    if (!userPreferences || !userPreferences.categories?.length) {
      setRecommended([]);
      return;
    }
    setRecommendedLoading(true);
    fetch(`/api/products/recommendations?categories=${encodeURIComponent(userPreferences.categories.join(","))}`)
      .then(res => res.json())
      .then(data => setRecommended(data.products || []))
      .catch(() => setRecommended([]))
      .finally(() => setRecommendedLoading(false));
  }, [userPreferences]);

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

  // Mock events (replace with backend fetch if needed)
  const upcomingEvents: Event[] = [
    {
      id: 1,
      title: "Artisan Market",
      date: "June 15, 2025",
      location: "City Center Plaza",
      image: "/images/events/market.png"
    },
    {
      id: 2,
      title: "Craft Workshop",
      date: "June 22, 2025",
      location: "Community Center",
      image: "/images/events/workshop.png"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <nav className="space-y-1">
                <button onClick={() => setActiveTab("overview")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "overview" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                  <User className="h-5 w-5" />
                  <span>Overview</span>


                </button>
                <button onClick={() => setActiveTab("orders")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "orders" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                  <Package className="h-5 w-5" />
                  <span>Orders</span>
                </button>
                <button onClick={() => setActiveTab("wishlist")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "wishlist" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                  <Heart className="h-5 w-5" />
                  <span>Wishlist</span>
                </button>
                <button onClick={() => setActiveTab("history")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "history" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                  <Clock className="h-5 w-5" />
                  <span>Recently Viewed</span>
                </button>
                <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "settings" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </button>
                <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
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
                        <h3 className="text-2xl font-bold">{orders.length}</h3>
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
                        <h3 className="text-2xl font-bold">{wishlist.length}</h3>
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
                    {recentlyViewedLoading ? (
                      <div>Loading...</div>
                    ) : recentlyViewed.length === 0 ? (
                      <div className="text-gray-500 col-span-3">No recently viewed products.</div>
                    ) : (
                      recentlyViewed.slice(0, 3).map(product => (
                        <RecentlyViewedProductCard key={product.id} product={product} />
                      ))
                    )}
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
                    {recommendedLoading ? (
                      <div>Loading...</div>
                    ) : recommended.length === 0 ? (
                      <div className="text-gray-500 col-span-3">No recommendations yet.</div>
                    ) : (
                      recommended.slice(0, 3).map((product) => (
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
                                  src={product.images?.[0] || "/placeholder.png"}
                                  alt={product.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                />
                              </div>
                              <div className="p-4">
                                <p className="text-xs text-gray-500 mb-1">{product.seller?.name}</p>
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
                      ))
                    )}
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
                  {ordersLoading ? (
                    <div>Loading...</div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-semibold">Order ID:</span> {order.id}
                            </div>
                            <span className="text-sm px-2 py-1 rounded bg-gray-100">{order.status}</span>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            Placed on: {order.createdAt}
                            {order.paidAt && <span> | Paid at: {order.paidAt}</span>}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Total:</span> ${order.total.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-semibold">Items:</span>
                            <ul className="ml-4 mt-1">
                              {order.items.map(item => (
                                <li key={item.id} className="flex items-center gap-2">
                                  {item.image && (
                                    <Image src={item.image} alt={item.name} width={32} height={32} className="rounded" />
                                  )}
                                  <span>{item.name} x {item.quantity}</span>
                                  <span className="ml-auto">${item.price.toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
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
      {wishlistLoading ? (
        <div>Loading...</div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {wishlist.map(item => {
            const product = item.product;
            if (!product) return null;
            const salePrice = product.discountPrice ?? product.price;
            const hasSignificantDiscount = (product.discountPercentage ?? 0) > 40;
            const productImages = Array.isArray(product.images) ? product.images : [];

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-4 flex flex-col items-stretch"
              >
                {/* Product Image */}
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-4">
                    <ProductImageGallery
                      images={productImages}
                      productName={product.name}
                    />
                  </div>
                </Link>
                {/* Product Details */}
                <div className="flex-1 flex flex-col justify-between">
                  {/* Category */}
                  <div>
                    <Link
                      href={`/categories/${product.category?.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {product.category?.name || "Uncategorized"}
                    </Link>
                  </div>
                  {/* Name */}
                  <Link href={`/products/${product.id}`}>
                    <h2 className="text-lg font-bold text-gray-900 mt-1 hover:text-primary transition-colors">
                      {product.name}
                    </h2>
                  </Link>
                  {/* Seller */}
                  <div className="text-xs text-gray-500 mb-2">
                    Sold by{" "}
                    <Link
                      href={`/sellers/${product.seller?.id}`}
                      className="text-primary hover:underline"
                    >
                      {product.seller?.name || "Unknown Seller"}
                    </Link>
                  </div>
                  {/* Price & Discount */}
                  <div className="flex items-center space-x-2 mb-2">
                    {product.discountPercentage && product.discountPercentage > 0 ? (
                      <>
                        <span className="text-base font-bold text-gray-900">
                          ₹{salePrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.price.toFixed(2)}
                        </span>
                        <Badge className={`${hasSignificantDiscount ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} px-2 py-1`}>
                          {Math.round(product.discountPercentage)}% OFF
                        </Badge>
                      </>
                    ) : (
                      <span className="text-base font-bold text-gray-900">
                        ₹{product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {/* Add to Cart Button */}
                  <div className="mt-3">
                    <AddToCartButton productId={product.id} stock={product.stock ?? 1} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
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
      )}
    </div>
  </div>
)}

            {/* Recently Viewed Tab */}
            {activeTab === "history" && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-medium mb-6">Recently Viewed Products</h2>
            
                  {recentlyViewedLoading ? (
                    <div>Loading...</div>
                  ) : recentlyViewed.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {recentlyViewed.map(product => (
                      <RecentlyViewedProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  ) : (
                    <div className="text-gray-500">No recently viewed products.</div>
                  )}
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