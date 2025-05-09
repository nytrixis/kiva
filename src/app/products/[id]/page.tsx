import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import Link from "next/link";
import AddToCartButton from "@/components/product/AddToCartButton";
import AddToWishlistButton from "@/components/product/AddToWishlistButton";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = params;
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
  
  if (!product) {
    return {
      title: "Product Not Found | Kiva",
    };
  }
  
  return {
    title: `${product.name} | Kiva`,
    description: product.description || undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params;
  
  // Fetch product with related data
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      seller: {
        include: {
          sellerProfile: {
            select: {
              businessName: true,
              status: true,
            },
          },
        },
      },
    },
  });
  
  if (!product || product.seller.sellerProfile?.status !== "APPROVED") {
    notFound();
  }
  
  // Increment view count
  await prisma.product.update({
    where: { id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });
  
  // Calculate sale price if there's a discount
  const salePrice = product.price - (product.price * (product.discountPercentage / 100));
  
  // Check if product has a significant discount (>40%)
  const hasSignificantDiscount = product.discountPercentage > 40;
  
  // Get product images
  const productImages = Array.isArray(product.images) ? product.images : [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <ProductImageGallery images={productImages.map(img => String(img))} productName={product.name} />
        </div>
        
        {/* Product Details */}
        <div className="space-y-6">
          {/* Category */}
          <div>
            <Link href={`/categories/${product.category?.slug}`} className="text-sm text-primary hover:underline">
              {product.category?.name || "Uncategorized"}
            </Link>
          </div>
          
          {/* Product Name */}
          <h1 className="text-3xl font-heading text-gray-900">{product.name}</h1>
          
          {/* Seller */}
          <div>
            <p className="text-sm text-gray-500">
              Sold by{" "}
              <Link href={`/sellers/${product.seller.id}`} className="text-primary hover:underline">
                {product.seller.sellerProfile?.businessName || product.seller.name || "Unknown Seller"}
              </Link>
            </p>
          </div>
          
          {/* Price */}
          <div className="flex items-center space-x-4">
            {product.discountPercentage > 0 ? (
              <>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(salePrice)}</span>
                <span className="text-lg text-gray-500 line-through">{formatCurrency(product.price)}</span>
                <Badge className={`${hasSignificantDiscount ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} px-2 py-1`}>
                  {Math.round(product.discountPercentage)}% OFF
                </Badge>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
            )}
          </div>
          
          {/* Stock Status */}
          <div>
            {product.stock > 0 ? (
              <p className="text-sm text-gray-700">
                In Stock
                {product.stock <= 5 && (
                  <span className="ml-2 text-orange-600">
                    (Only {product.stock} left)
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-red-600">Out of Stock</p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <AddToCartButton productId={product.id} stock={product.stock} />
            <AddToWishlistButton productId={product.id} />
          </div>
          
          {/* Description */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
            <div className="prose prose-sm text-gray-700">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p>No description available for this product.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );}
