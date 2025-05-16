"use client";
import { useEffect } from "react";

export default function AddToRecentlyViewed({ product }: { product: any }) {
  useEffect(() => {
    if (
      !product ||
      !product.id ||
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
      body: JSON.stringify(product),
    });
  }, [product]);

  return null;
}