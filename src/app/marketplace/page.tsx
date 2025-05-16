import { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";

export const metadata: Metadata = {
  title: "Marketplace | Kiva",
  description: "Explore all products from verified sellers on Kiva",
};

export default async function MarketplacePage() {
  // Fetch products from verified sellers via REST API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products`,
    { cache: "no-store" }
  );
  const data = res.ok ? await res.json() : { products: [] };
  const products = data.products || [];

  const productList = products.map((p: any) => ({
  ...p,
  images: Array.isArray(p.images)
    ? p.images.filter((img: unknown): img is string => typeof img === "string")
    : [],
}));

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-primary mb-2">Marketplace</h1>
      <p className="text-gray-600 mb-8">
        Explore all products from our verified sellers
      </p>
      
      {products.length > 0 ? (
        <ProductGrid products={productList} loading={false} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
}