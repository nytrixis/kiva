import { Metadata } from "next";
import ShopsGrid from "@/components/shop/ShopsGrid";
import ShopsFilter from "@/components/shop/ShopsFilter";

export const metadata: Metadata = {
  title: "Explore Shops | Kiva",
  description: "Discover unique local businesses and artisans on Kiva",
};

interface Category {
  name: string;
}

interface Seller {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  description: string | null;
  phoneNumber: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  taxId: string | null;
  categories: string[];
  status: string;
  verifiedAt: string | null;
  identityDocument: string | null;
  businessDocument: string | null;
  logoImage: string | null;
  createdAt: string;
  updatedAt: string;
  avgRating: number;
}

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

  // Fetch all seller profiles that are approved via Supabase REST API
  const sellersRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/shops?${categories ? `categories=${categories.join(",")}&` : ""}${minRating ? `minRating=${minRating}` : ""}`,
    { cache: "no-store" }
  );
  const sellersWithRating = sellersRes.ok ? await sellersRes.json() : [];

  // Fetch all unique categories for the filter via Supabase REST API
  const categoriesRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/categories`,
    { cache: "no-store" }
  );
  let allCategories = categoriesRes.ok ? await categoriesRes.json() : [];
  if (!Array.isArray(allCategories)) allCategories = [];
  const categoryOptions = allCategories.map((cat: Category) => cat.name);

  // Filter by rating if needed (if not handled in API)
  const filteredSellers = minRating
    ? sellersWithRating.filter((seller: Seller) => seller.avgRating >= minRating)
    : sellersWithRating;

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