"use client";
import { useEffect } from "react";

interface RecentlyViewedProduct {
  productId: string;
  name: string;
  price: number;
  image: string;
  vendor: string;
  category: string;
  link: string;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
}

export default function AddToRecentlyViewed({ product }: { product: RecentlyViewedProduct }) {
  useEffect(() => {
    if (
      !product ||
      !product.productId ||
      !product.name ||
      !product.price ||
      !product.image ||
      !product.vendor ||
      !product.category ||
      !product.link
    ) {
      return;
    }
    fetch("/api/recently-viewed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, productId: product.productId }),
    });
  }, [product]);

  return null;
}