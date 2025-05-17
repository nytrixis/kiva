import { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Recommended For You | Kiva",
  description: "Products recommended for you based on your preferences.",
};

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

export default async function RecommendationsPage() {
  // Get user session (server-side)
  const session = await getServerSession(authOptions);

  // If not logged in, redirect to sign-in
  if (!session || !session.user) {
    // You can use redirect() from next/navigation if you want
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-heading text-primary mb-2">Recommended For You</h1>
        <p className="text-gray-600 mb-8">Please sign in to see your recommendations.</p>
      </div>
    );
  }

  // Fetch user preferences
  const prefRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/user/preferences`,
    { headers: { Cookie: "" }, cache: "no-store" }
  );
  const prefData = prefRes.ok ? await prefRes.json() : { preferences: { categories: [] } };
  const categories = prefData.preferences?.categories || [];

  let products: Product[] = [];
  if (categories.length > 0) {
    // Fetch recommended products
    const recRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products/recommendations?categories=${encodeURIComponent(categories.join(","))}`,
      { headers: { Cookie: "" }, cache: "no-store" }
    );
    const recData = recRes.ok ? await recRes.json() : { products: [] };
    products = recData.products || [];
  }

  // Ensure images is always an array of strings
  const productList = products.map((p: Product) => ({
  ...p,
  images: Array.isArray(p.images)
    ? p.images.filter((img: unknown): img is string => typeof img === "string" && img.trim() !== "")
    : [],
  category: p.category ?? { name: "Uncategorized" },
  seller: p.seller ?? { name: "Unknown Seller" },
}));

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-primary mb-2">Recommended For You</h1>
      <p className="text-gray-600 mb-8">
        Products picked for you based on your preferences.
      </p>
      {productList.length > 0 ? (
        <ProductGrid products={productList} loading={false} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No recommendations found. Update your preferences to get personalized suggestions!</p>
        </div>
      )}
    </div>
  );
}