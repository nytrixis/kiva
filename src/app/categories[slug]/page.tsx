import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCatalog from "@/components/product/ProductCatalog";
import CategoryHero from "@/components/category/CategoryHero";
import { prisma } from "@/lib/db";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = params;
  
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  
  if (!category) {
    return {
      title: "Category Not Found | Kiva",
    };
  }
  
  return {
    title: `${category.name} | Kiva`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = params;
  
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  
  if (!category) {
    notFound();
  }
  
  // Fetch all categories for filters
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });
  
  return (
    <div className="min-h-screen bg-background">
      <CategoryHero category={category} />
      
      <div className="container mx-auto px-4 py-12">
        <ProductCatalog 
          categories={categories} 
          initialCategory={category.id} 
        />
      </div>
    </div>
  );
}
