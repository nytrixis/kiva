import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";

interface WishlistItemProps {
  item: {
    id: string;
    product: {
      id: string;
      name: string;
      price: number;
      discountPercentage: number;
      images: string[] | any;
      category?: {
        name: string;
      };
      seller?: {
        name: string;
      };
    };
  };
  onRemoveItem: (id: string) => void;
  onAddToCart: (productId: string) => void;
  isUpdating: boolean;
}

export default function WishlistItem({ 
  item, 
  onRemoveItem, 
  onAddToCart, 
  isUpdating 
}: WishlistItemProps) {
  const { product, id } = item;
  const [ setIsHovered] = useState(false);
 
  // Calculate the price to display (based on discount percentage)
  const displayPrice = product.discountPercentage > 0 
    ? product.price * (1 - product.discountPercentage / 100) 
    : product.price;
 
  // Get the first image from the product images array
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : "/images/placeholder-product.jpg";
 
  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center py-6 border-b border-gray-200"
    >
      {/* Product Image */}
      <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 mb-4 sm:mb-0">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 96px, 112px"
        />
      </div>
      
      {/* Product Details */}
      <div className="flex-grow sm:ml-6 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        <div className="flex-grow">
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-lg font-medium text-gray-800 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="mt-1 text-sm text-gray-500">
            {product.category?.name && (
              <span className="mr-3">{product.category.name}</span>
            )}
            {product.seller?.name && (
              <span>Seller: {product.seller.name}</span>
            )}
          </div>
          
          {/* Price information */}
          <div className="mt-2 flex items-center">
            <span className="font-semibold text-gray-900">
              ₹{displayPrice.toFixed(2)}
            </span>
            
            {product.discountPercentage > 0 && (
              <>
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="ml-2 text-xs font-medium text-green-600">
                  {product.discountPercentage}% off
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center mt-4 sm:mt-0 space-x-4">
          <button
            onClick={() => onAddToCart(product.id)}
            disabled={isUpdating}
            className="flex items-center bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </button>
          
          <button
            onClick={() => onRemoveItem(id)}
            disabled={isUpdating}
            className="text-gray-500 hover:text-red-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            aria-label="Remove from wishlist"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
