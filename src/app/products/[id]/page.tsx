import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/product/AddToCartButton";
import AddToWishlistButton from "@/components/product/AddToWishlistButton";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import AddToRecentlyViewed from "@/components/AddToRecentlyViewed";


// interface Category {
//   id: string;
//   name: string;
//   slug: string;
// }

// interface SellerProfile {
//   businessName: string;
//   logoImage?: string;
//   status: string;
// }

// interface Seller {
//   id: string;
//   name: string;
//   sellerProfile?: SellerProfile;
// }

// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   discountPercentage: number;
//   images: string[] | string;
//   stock: number;
//   description: string;
//   category?: Category;
//   seller: Seller;
// }

interface ProductPageParams {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageParams): Promise<Metadata> {
  const { id } = await params;

  // Fetch product from Supabase REST API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/product/${id}`,
    { cache: "no-store" }
  );
  const product = res.ok ? await res.json() : null;

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

export default async function ProductPage({ params }: ProductPageParams) {
  const { id } = await params;

  // Fetch product with related data from Supabase REST API
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/product/${id}`,
    { cache: "no-store" }
  );
  const product = res.ok ? await res.json() : null;

  if (
    !product ||
    product.seller?.sellerProfile?.status !== "APPROVED"
  ) {
    notFound();
  }

  // Increment view count via Supabase REST API (optional, if you have such endpoint)
  await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/supabase/product/${id}/increment-view`,
    { method: "POST" }
  );

  // Calculate sale price if there's a discount
  const salePrice = product.price - product.price * (product.discountPercentage / 100);

  // Check if product has a significant discount (>40%)
  const hasSignificantDiscount = product.discountPercentage > 40;

  // Get product images
  const productImages = Array.isArray(product.images) ? product.images : [];

  return (
    
    <div className="container mx-auto py-8 px-4">
      <AddToRecentlyViewed
  product={{
    productId: product.id,
    name: product.name,
    price: product.price,
    image: Array.isArray(product.images) ? product.images[0] : product.images,
    vendor: product.seller?.sellerProfile?.businessName || product.seller?.name || "",
    category: product.category?.name || "",
    link: `/products/${product.id}`,
    discountPercentage: product.discountPercentage ?? 0,
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    originalPrice: product.price, // or product.originalPrice if you have it
  }}
/>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
<ProductImageGallery images={productImages.map((img: string) => String(img))} productName={product.name} />
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
                <span className="text-2xl font-bold text-gray-900">
                  ₹{salePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
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

          {/* Rating & Reviews */}
          {(product.rating ?? 0) >= 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500 flex items-center">
                {/* Star Icon */}
                <svg className="w-5 h-5 mr-1 fill-yellow-400" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/>
                </svg>
                <span className="font-semibold">{Number(product.rating).toFixed(1)}</span>
              </span>
              <span className="text-gray-500 text-sm">
                ({product.reviewCount ?? 0} review{(product.reviewCount ?? 0) !== 1 ? "s" : ""})
              </span>
            </div>
          )}

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
  );
}