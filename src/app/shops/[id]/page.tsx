import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { MapPin, Star, Package, Calendar } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import ShopStats from "@/components/shop/ShopStats";
import ShopProductSearch from "@/components/shop/ShopProductSearch";

interface ShopPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { id } = await params;
  
  const shop = await prisma.sellerProfile.findUnique({
    where: { id },
    select: {
      businessName: true,
      description: true,
    },
  });
  
  if (!shop) {
    return {
      title: "Shop Not Found | Kiva",
    };
  }
  
  return {
    title: `${shop.businessName} | Kiva`,
    description: shop.description || undefined,
  };
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const searchQuery = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
  
  const shop = await prisma.sellerProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          products: {
            where: searchQuery ? {
              name: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            } : undefined,
            include: {
              category: true,
              seller: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
    },
  });
  
  if (!shop || shop.status !== "APPROVED") {
    notFound();
  }
  
  // Calculate shop stats
  const totalProducts = shop.user.products.length;
  const avgRating = shop.user.products.reduce((sum, product) => sum + product.rating, 0) / 
    (totalProducts || 1);
  
  // For demo purposes, we'll create some mock stats
  const mockStats = {
    totalOrders: Math.floor(Math.random() * 500) + 50,
    totalCustomers: Math.floor(Math.random() * 300) + 30,
    satisfactionRate: Math.floor(Math.random() * 15) + 85,
  };
  
  // Generate monthly data for the graph
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    
    return {
      month: format(month, 'MMM'),
      products: Math.floor(Math.random() * 10) + 5,
      customers: Math.floor(Math.random() * 20) + 10,
    };
  }).reverse();

  const formattedProducts = shop.user.products.map(product => {
  // Handle images conversion more explicitly
  let processedImages: string[] = [];
  
  if (product.images) {
    if (Array.isArray(product.images)) {
      // If it's already an array, map each item to string if possible
      processedImages = product.images.map(img => 
        typeof img === 'string' ? img : ''
      ).filter(Boolean);
    } else if (typeof product.images === 'object') {
      // If it's an object, try to extract values as strings
      processedImages = Object.values(product.images)
        .map(img => typeof img === 'string' ? img : '')
        .filter(Boolean);
    }
  }
  
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    discountPercentage: product.discountPercentage,
    images: processedImages, // Now it's explicitly a string[]
    rating: product.rating,
    reviewCount: product.reviewCount,
    category: {
      name: product.category.name
    },
    seller: {
      name: product.seller.name
    },
    stock: product.stock
  };
});

  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Shop Header */}
      <div className="relative mb-8">
        {/* Banner */}
        <div className="relative h-48 md:h-64 w-full rounded-xl overflow-hidden bg-accent/30">
          {shop.bannerImage ? (
            <Image
              src={shop.bannerImage}
              alt={`${shop.businessName} banner`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-primary text-6xl font-heading">Kiva</span>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        {/* Shop info overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
          <div className="flex items-end">
            {/* Logo */}
            <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white mr-4 md:mr-6">
              <Image
                src={shop.logoImage || "/images/placeholder-logo.jpg"}
                alt={shop.businessName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 96px, 128px"
              />
            </div>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-heading mb-1">{shop.businessName}</h1>
              <p className="text-white/90 mb-2">{shop.businessType}</p>
              
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{shop.city}, {shop.state}, {shop.country}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Shop info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search Products in this shop */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading text-lg">Search Products</h2>
            </div>
            <div className="p-6">
              <ShopProductSearch initialQuery={searchQuery} shopId={id} />
            </div>
          </div>
          
          {/* About */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading text-lg">About</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                {shop.description || "No description available."}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <span className="text-gray-500">Member since</span>
                    <p className="font-medium">
                      {format(new Date(shop.user.createdAt), "MMMM yyyy")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <Package className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <span className="text-gray-500">Products</span>
                    <p className="font-medium">{totalProducts}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <span className="text-gray-500">Average Rating</span>
                    <p className="font-medium flex items-center">
                      {avgRating.toFixed(1)}
                      <div className="ml-2 flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < Math.round(avgRating) 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Categories */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading text-lg">Categories</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {shop.categories.map((category, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Shop Stats */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading text-lg">Shop Performance</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-primary">
                    {mockStats.totalOrders}
                  </div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-semibold text-primary">
                    {mockStats.totalCustomers}
                  </div>
                  <div className="text-xs text-gray-500">Customers</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-semibold text-green-600">
                    {mockStats.satisfactionRate}%
                  </div>
                  <div className="text-xs text-gray-500">Satisfaction</div>
                </div>
              </div>
              
              {/* Performance Graph */}
              <ShopStats data={monthlyData} />
            </div>
          </div>
        </div>

        {/* Mobile search - visible only on smaller screens */}
        <div className="lg:hidden mb-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-heading text-lg">Search Products</h2>
            </div>
            <div className="p-6">
            <ShopProductSearch initialQuery={searchQuery} shopId={id} />
            </div>
        </div>
        </div>
        
        {/* Right column - Products */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-heading text-lg">
                {searchQuery ? `Search Results: "${searchQuery}"` : "Products"}
              </h2>
              <span className="text-sm text-gray-500">{shop.user.products.length} items</span>
            </div>
            
            <div className="p-6">
              {shop.user.products.length > 0 ? (
                <ProductGrid products={formattedProducts} loading={false} />

              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {searchQuery ? "No matching products found" : "No products yet"}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery 
                      ? `Try a different search term or browse all products from this shop.`
                      : `This shop hasn't added any products yet.`
                    }
                  </p>
                  {searchQuery && (
                    <a 
                      href={`/shops/${id}`}
                      className="inline-block mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      View All Products
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}