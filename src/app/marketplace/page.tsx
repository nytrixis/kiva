import { Metadata } from "next";
import { prisma } from "@/lib/db";
import ProductGrid from "@/components/product/ProductGrid";

export const metadata: Metadata = {
  title: "Marketplace | Kiva",
  description: "Explore all products from verified sellers on Kiva",
};

export default async function MarketplacePage() {
  // Fetch products from verified sellers
  
  const productsRaw = await prisma.product.findMany({
    where: {
      seller: {
        sellerProfile: {
          status: "APPROVED",
        },
      },
    },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc", // Oldest first
    },
  });

  const products = productsRaw.map((p) => ({
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
      
      {products.length > 0 ? (
        <ProductGrid products={products} loading = {false} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
}
