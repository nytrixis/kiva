import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import ProductForm from "@/components/seller/product/ProductForm";

export const metadata = {
  title: "Create New Product | Seller Dashboard",
  description: "Create a new product to sell on Kiva",
};

interface Category {
  id: string;
  name: string;
}

export default async function NewProductPage() {
  // Check if user is authenticated and is a seller
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin?callbackUrl=/seller/products/new");
  }

  if (session.user.role !== "SELLER") {
    redirect("/access-denied?message=You need a seller account to access this page");
  }

  // Fetch categories via Supabase REST API
  const categoriesRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/categories`,
    { cache: "no-store" }
  );
  const categoriesJson = categoriesRes.ok ? await categoriesRes.json() : [];
  const dbCategories = Array.isArray(categoriesJson)
    ? categoriesJson
    : categoriesJson.categories ?? [];

  // Define our preferred category names
  const preferredCategories = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Books",
    "Toys & Games",
    "Handcrafted",
    "Jewelry & Accessories",
    "Art & Collectibles",
    "Food & Beverages"
  ];

  // Create a mapping of database categories to preferred names
  const categories = dbCategories.map((dbCat: Category) => {
    // Try to find a matching preferred category
    const matchingCategory = preferredCategories.find(preferred =>
      dbCat.name.toLowerCase().includes(preferred.toLowerCase())
    );

    return {
      id: dbCat.id,
      name: matchingCategory || dbCat.name
    };
  });

  // If we don't have enough categories, use the database ones directly
  if (categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductForm categories={dbCategories} />
      </div>
    );
  }

  // Filter out any categories with empty IDs
  const validCategories = categories.filter((cat: Category) => cat.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductForm categories={validCategories} />
    </div>
  );
}