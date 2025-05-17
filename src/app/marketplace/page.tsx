import { Metadata } from "next";
import ProductCatalog from "@/components/product/ProductCatalog";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Marketplace | Kiva",
  description: "Explore all products from verified sellers on Kiva",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the Product interface
interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage: number;
  images: string[];
  rating: number;
  reviewCount: number;
  category: {
    name: string;
  };
  seller: {
    name: string;
  };
  stock?: number;
  isFavorite?: boolean;
}

export default async function MarketplacePage() {
  // Fetch all categories for filters
  const { data: allCategories } = await supabase
    .from("Category")
    .select("id, name")
    .order("name", { ascending: true });

  // Fetch all products from API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products`,
    { cache: "no-store" }
  );
  const data = res.ok ? await res.json() : { products: [] };
  const products: Product[] = data.products || [];

  // Prepare product list (ensure images is always an array)
  const productList: Product[] = products.map((p) => ({
    ...p,
    images: Array.isArray(p.images)
      ? p.images.filter((img): img is string => typeof img === "string")
      : [],
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-primary mb-2">Marketplace</h1>
      <p className="text-gray-600 mb-8">
        Explore all products from our verified sellers
      </p>

      <ProductCatalog
        categories={allCategories || []}
        initialCategory={undefined}
        products={productList}
      />
    </div>
  );
}