import { Metadata } from "next";
import { Suspense } from "react";
import ProductCatalog from "@/components/product/ProductCatalog";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Collections | Kiva",
  description: "Explore our unique collection of handcrafted products from local artisans",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function CollectionsPage() {
  // Fetch categories for filters
  const { data } = await supabase
    .from("Category")
    .select("*")
    .order("name", { ascending: true });
  const categories = data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4 text-center">
          Our <span className="text-primary">Collections</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-center mb-12">
          Discover unique products from local artisans across India, handcrafted with love and tradition
        </p>
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductCatalog categories={categories} products={[]} />
        </Suspense>
      </div>
    </div>
  );
}