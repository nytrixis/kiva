import { Metadata } from "next";
import { redirect } from "next/navigation";
import ProductCatalog from "@/components/product/ProductCatalog";

export const metadata: Metadata = {
  title: "Search Results | Kiva",
  description: "Find products from local artisans",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

// interface Category {
//   id: string;
//   name: string;
// }

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = await searchParams;

  if (!query) {
    redirect("/collections");
  }

  // Fetch categories for filters via Supabase REST API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/categories`,
    { cache: "no-store" }
  );
const categoriesData = res.ok ? await res.json() : { categories: [] };
const categories = Array.isArray(categoriesData.categories) ? categoriesData.categories : [];
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
          Search Results for <span className="text-primary">&quot;{query}&quot;</span>
        </h1>
        
        <ProductCatalog
          categories={categories}
          searchQuery={query}
          products={[]}
        />
      </div>
    </div>
  );
}