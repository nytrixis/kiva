import { Metadata } from "next";
import { redirect } from "next/navigation";
import ProductCatalog from "@/components/product/ProductCatalog";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Search Results | Kiva",
  description: "Find products from local artisans",
};

export default async function SearchPage({ searchParams }) {
  const query = searchParams.q;
  
  if (!query) {
    redirect("/collections");
  }
  
  // Fetch categories for filters
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
          Search Results for <span className="text-primary">"{query}"</span>
        </h1>
        
        <ProductCatalog 
          categories={categories} 
          searchQuery={query} 
        />
      </div>
    </div>
  );
}
