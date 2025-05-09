import { Metadata } from "next";
import { redirect } from "next/navigation";
import ProductCatalog from "@/components/product/ProductCatalog";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Search Results | Kiva",
  description: "Find products from local artisans",
};

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q;
  
  if (!query) {
    redirect("/collections");
  }
  
  // Fetch categories for filters
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  }) as Category[];
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
          Search Results for <span className="text-primary">&quot;{query}&quot;</span>
        </h1>
        
        <ProductCatalog
          categories={categories}
          searchQuery={query}
        />
      </div>
    </div>
  );
}
