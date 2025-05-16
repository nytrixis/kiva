import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCatalog from "@/components/product/ProductCatalog";
import CategoryHero from "@/components/category/CategoryHero";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type CategoryPageParams = {
  params: { slug: string };
};

export async function generateMetadata({ params }: CategoryPageParams): Promise<Metadata> {
  const { slug } = await params;

  const { data: category } = await supabase
    .from("Category")
    .select("*")
    .eq("slug", slug)
    .single();

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
  const { slug } = await params;

  // Get the category by slug
  const { data: category } = await supabase
    .from("Category")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  // Get products for this category
  const { data: products } = await supabase
    .from("Product")
    .select("*")
    .eq("categoryId", category.id);

  // Get all categories for filters
  const { data: allCategories } = await supabase
    .from("Category")
    .select("id, name")
    .order("name", { ascending: true });

  // Prepare data for the hero component
  const categoryForHero = {
    name: category.name,
    description: category.description || undefined,
    bannerImage: category.bannerImage || undefined,
    productCount: Array.isArray(products) ? products.length : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <CategoryHero category={categoryForHero} />
      <div className="container mx-auto px-4 py-12">
        <ProductCatalog
          categories={allCategories || []}
          initialCategory={category.id}
        />
      </div>
    </div>
  );
}