import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ProductForm from "@/components/seller/product/ProductForm";

export const metadata = {
  title: "Create New Product | Seller Dashboard",
  description: "Create a new product to sell on Kiva",
};

export default async function NewProductPage() {
  // Check if user is authenticated and is a seller
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/signin?callbackUrl=/seller/products/new");
  }
  
  if (session.user.role !== "SELLER") {
    redirect("/access-denied?message=You need a seller account to access this page");
  }
  
  // Fetch categories for the form
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductForm categories={categories} />
    </div>
  );
}
