import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCatalog from "@/components/product/ProductCatalog";
import CategoryHero from "@/components/category/CategoryHero";
import { prisma } from "@/lib/db";

// Import the Category type from CategoryHero to ensure compatibility
type CategoryPageParams = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: CategoryPageParams): Promise<Metadata> {
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
    description: category.description || undefined,
  };
}

export default async function CategoryPage({ params }: CategoryPageParams) {
  const { slug } = params;
  
  // Get the category with product count
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
  
  if (!category) {
    notFound();
  }
  
  // Transform the category to match the expected interface in CategoryHero
  const categoryForHero = {
    name: category.name,
    description: category.description || undefined, // Convert null to undefined
    bannerImage: category.bannerImage || undefined, // Convert null to undefined
    productCount: category._count.products
  };
  
  // Fetch all categories for filters
  const allCategories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true
    }
  });
  
  return (
    <div className="min-h-screen bg-background">
      <CategoryHero category={categoryForHero} />
      
      <div className="container mx-auto px-4 py-12">
        <ProductCatalog
          categories={allCategories}
          initialCategory={category.id}
        />
      </div>
    </div>
  );
}
