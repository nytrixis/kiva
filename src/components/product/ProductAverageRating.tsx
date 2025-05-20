"use client";
import { useEffect, useState } from "react";

type Review = { rating: number };

function StarIcon({ filled = false, className = "w-5 h-5" }) {
  return (
    <svg
      className={`${className} ${filled ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
      viewBox="0 0 20 20"
    >
      <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
    </svg>
  );
}

export default function ProductAverageRating({ productId }: { productId: string }) {
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`/api/reviews/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        const reviews: Review[] = data.reviews || [];
        setCount(reviews.length);
        setAvg(
          reviews.length
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0
        );
      });
  }, [productId]);

  if (count === 0) {
    return (
      <div className="flex items-center space-x-2 mt-2">
        <span className="text-yellow-500 flex items-center">
          <StarIcon filled={false} className="w-5 h-5 mr-1" />
          <span className="font-semibold">0.0</span>
        </span>
        <span className="text-gray-500 text-sm">
          (0 reviews)
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 mt-2">
      <span className="text-yellow-500 flex items-center">
        <StarIcon filled className="w-5 h-5 mr-1" />
        <span className="font-semibold">{avg.toFixed(1)}</span>
      </span>
      <span className="text-gray-500 text-sm">
        ({count} review{count !== 1 ? "s" : ""})
      </span>
    </div>
  );
}