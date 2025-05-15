import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import EditProductForm from "@/components/seller/product/EditProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is a seller
  if (!session?.user || session.user.role !== "SELLER") {
    redirect("/login?callbackUrl=/seller/products");
  }

  // Fetch the product
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  // Check if product exists and belongs to the seller
  if (!product || product.sellerId !== session.user.id) {
    redirect("/seller/products");
  }

  // Transform the product data to match the expected types
  const formattedProduct = {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    discountPercentage: product.discountPercentage,
    stock: product.stock,
    images: product.images as string[], // Cast JSON data to string[]
    categoryId: product.categoryId,
  };

  // Fetch categories for the form
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-800">Edit Product</h1>
        <p className="text-gray-600 mt-1">
          Update your product information and make changes to keep it up to date.
        </p>
      </div>
      
      <EditProductForm 
        product={formattedProduct}
        categories={categories} 
      />
    </div>
  );
}