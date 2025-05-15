import { Metadata } from "next";
import { prisma } from "@/lib/db";
import ShopsGrid from "@/components/shop/ShopsGrid";
import ShopsFilter from "@/components/shop/ShopsFilter";

export const metadata: Metadata = {
  title: "Explore Shops | Kiva",
  description: "Discover unique local businesses and artisans on Kiva",
};

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  // Parse filter parameters
  const categories = resolvedSearchParams.categories 
    ? Array.isArray(resolvedSearchParams.categories) 
      ? resolvedSearchParams.categories 
      : [resolvedSearchParams.categories]
    : undefined;
    
  const minRating = resolvedSearchParams.minRating 
    ? parseFloat(resolvedSearchParams.minRating as string) 
    : undefined;
  // Fetch all seller profiles that are approved
  const sellerProfiles = await prisma.sellerProfile.findMany({
    where: {
      status: "APPROVED",
      ...(categories && categories.length > 0 && {
        categories: {
          hasSome: categories,
        },
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          products: {
            select: {
              rating: true,
            },
          },
        },
      },
    },
  });

  // Calculate average rating for each seller
  const sellersWithRating = sellerProfiles.map(seller => {
    const products = seller.user.products;
    const totalRating = products.reduce((sum, product) => sum + product.rating, 0);
    const avgRating = products.length > 0 ? totalRating / products.length : 0;
    
    return {
      ...seller,
      avgRating,
    };
  });

  // Filter by rating if needed
  const filteredSellers = minRating 
    ? sellersWithRating.filter(seller => seller.avgRating >= minRating)
    : sellersWithRating;

  // Get all unique categories for the filter
  const allCategories = await prisma.category.findMany({
    select: {
      name: true,
    },
  });
  
  const categoryOptions = allCategories.map(cat => cat.name);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-primary mb-2">Explore Shops</h1>
      <p className="text-gray-600 mb-8">
        Discover unique local businesses and artisans
      </p>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="w-full md:w-1/4">
          <ShopsFilter 
            selectedCategories={categories || []} 
            minRating={minRating} 
            categoryOptions={categoryOptions}
          />
        </div>
        
        {/* Main content */}
        <div className="w-full md:w-3/4">
          {filteredSellers.length > 0 ? (
            <ShopsGrid shops={filteredSellers} />
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-medium text-gray-800 mb-2">No shops found</h2>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters to see more results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
