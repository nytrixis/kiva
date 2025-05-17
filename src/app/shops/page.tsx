"use client";
import { useMemo, useEffect, useState } from "react";
import ShopsGrid from "@/components/shop/ShopsGrid";
import ShopsFilter from "@/components/shop/ShopsFilter";
import { useRouter, useSearchParams, usePathname } from "next/navigation";


// export const metadata: Metadata = {
//   title: "Explore Shops | Kiva",
//   description: "Discover unique local businesses and artisans on Kiva",
// };

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

// This must be a Client Component to use hooks
export default function ShopsPageWrapper() {
  return <ShopsPage />;
}



function ShopsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filter parameters from the hook
  const categories = searchParams.get("categories")
    ? searchParams.get("categories")!.split(",").filter(Boolean)
    : [];

  const minRating = searchParams.get("minRating")
    ? parseFloat(searchParams.get("minRating")!)
    : undefined;

  // Fetch all seller profiles that are approved via Supabase REST API
  // (You may want to move this to an API route for SSR)
  const [sellersWithRating, setSellersWithRating] = useState<Seller[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);

  useEffect(() => {
  const fetchSellers = async () => {
    const sellersRes = await fetch(
      `/api/supabase/shops?${categories.length ? `categories=${categories.join(",")}&` : ""}${minRating ? `minRating=${minRating}` : ""}`,
      { cache: "no-store" }
    );
    const sellers = sellersRes.ok ? await sellersRes.json() : [];
    setSellersWithRating(sellers);
  };
  fetchSellers();
}, [categories, minRating]);

// Fetch categories only once on mount
useEffect(() => {
  const fetchCategories = async () => {
    const categoriesRes = await fetch(`/api/categories`, { cache: "no-store" });
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { categories: [] };
    const cats = Array.isArray(categoriesData.categories) ? categoriesData.categories : [];
    setCategoryOptions(cats.map((cat: Category) => cat.name));
  };
  fetchCategories();
}, []);

  // Filter by rating if needed (if not handled in API)
  const filteredSellers = useMemo(
    () =>
      minRating
        ? sellersWithRating.filter((seller) => seller.avgRating >= minRating)
        : sellersWithRating,
    [sellersWithRating, minRating]
  );

  // Handler to update filters in the URL
 const updateFilters = (filters: { categories?: string[]; minRating?: number }) => {
  const params = new URLSearchParams(searchParams.toString());

  if (filters.categories) {
    if (filters.categories.length > 0) {
      params.set("categories", filters.categories.join(","));
    } else {
      params.delete("categories");
    }
  }
  if (filters.minRating !== undefined) {
    if (filters.minRating) {
      params.set("minRating", filters.minRating.toString());
    } else {
      params.delete("minRating");
    }
  }
  router.push(`${pathname}?${params.toString()}`);
};

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
            selectedCategories={categories}
            minRating={minRating}
            categoryOptions={categoryOptions}
            onFilterChange={updateFilters}
          />
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4">
          {filteredSellers.length > 0 ? (
            <ShopsGrid shops={filteredSellers.map(seller => ({
              ...seller,
              city: seller.city ?? "",
              address: seller.address ?? "",
              state: seller.state ?? "",
              postalCode: seller.postalCode ?? "",
              country: seller.country ?? "",
              businessName: seller.businessName ?? "",
              businessType: seller.businessType ?? "",
              user: {
                id: seller.userId,
                name: null,
              }
            }))} />
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