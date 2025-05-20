"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  userId: string;
  User?: { name: string; image?: string | null };
}

interface ApiReview {
  id: string;
  rating: number;
  reviewtext: string;
  createdat: string;
  userid: string;
  User?: { name: string; image?: string | null };
}


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

export default function ProductReviewSection({
  productId,
  sellerId,
}: {
  productId: string;
  sellerId: string;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Map API fields to camelCase
  const mapReview = (r: ApiReview): Review => ({
    ...r,
    reviewText: r.reviewtext,
    createdAt: r.createdat,
    userId: r.userid,
    User: r.User,
  });

  useEffect(() => {
    fetch(`/api/reviews/${productId}`)
      .then((res) => res.json())
      .then((data) => setReviews((data.reviews || []).map(mapReview)))
      .finally(() => setLoading(false));
  }, [productId]);

  const hasReviewed = !!reviews.find((r) => r.userId === userId);
  const isSeller = userId === sellerId;

  // const avgRating =
  //   reviews.length > 0
  //     ? (
  //         reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  //       ).toFixed(1)
  //     : "0.0";

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        productid: productId,
        userid: userId,
        rating,
        reviewtext: reviewText,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to submit review.");
      setSubmitting(false);
      return;
    }

    setRating(0);
    setReviewText("");
    // Refetch reviews and map fields
    const reviewsRes = await fetch(`/api/reviews/${productId}`);
    const reviewsData = await reviewsRes.json();
    setReviews((reviewsData.reviews || []).map(mapReview));
    setSubmitting(false);
  };

  return (
    <div className="mt-8">

      {/* Review Form */}
      {userId && !isSeller && !hasReviewed && (
        <div className="mb-8 bg-gray-50 rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold mb-2">Leave a Review</h4>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <StarIcon filled={star <= rating} />
              </button>
            ))}
          </div>
          <textarea
            className="w-full border rounded p-2 mb-2"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review (optional)"
            rows={3}
          />
          <button
            className="px-4 py-2 bg-primary text-white rounded"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h4 className="font-semibold mb-4">Reviews</h4>
        {loading ? (
          <div>Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500">No reviews yet.</div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="flex gap-3 items-start bg-white rounded-lg shadow p-4">
                {/* User Avatar */}
                <div>
                  {review.User?.image ? (
                    <img
                      src={review.User.image}
                      alt={review.User.name || "User"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border">
                      {review.User?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{review.User?.name || "User"}</span>
                    <span className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          filled={star <= review.rating}
                          className="w-4 h-4"
                        />
                      ))}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  {review.reviewText && (
                    <div className="text-gray-700 text-sm mt-1">{review.reviewText}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}