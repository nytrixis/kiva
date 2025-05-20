import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reelId = searchParams.get("reelId");
  const userId = searchParams.get("userId");
  const categoryId = searchParams.get("categoryId");
  const userIdMatch = searchParams.get("userIdMatch");

  // Build filter
  const orFilters = [];
  if (userIdMatch) orFilters.push(`userId.eq.${userIdMatch}`);
  if (categoryId) orFilters.push(`product.categoryId.eq.${categoryId}`);

  // Fetch related reels
  let query = supabase
    .from("reels")
    .select(`
      *,
      user:user_id (
        id,
        name,
        image,
        sellerProfile:seller_profile_id (
          businessName,
          logoImage
        )
      ),
      product:product_id (
        id,
        name,
        price,
        images,
        discountPercentage,
        categoryId
      ),
      likes:user_id (
        id
      ),
      _count:reels (
        likes,
        comments
      )
    `)
    .neq("id", reelId)
    .order("createdAt", { ascending: false })
    .limit(10);

  // Add OR filter for userId or categoryId
  if (orFilters.length > 0) {
    query = query.or(orFilters.join(","));
  }

  const { data: relatedReels, error } = await query;

  if (error) {
    return NextResponse.json([], { status: 200 });
  }

  // Filter likes for the current user
const result = (relatedReels || []).map((reel: { likes: { id: string }[] }) => ({
    ...reel,
    likes: Array.isArray(reel.likes) && userId
? reel.likes.filter((like: { id: string }) => like.id === userId)      : [],
  }));

  return NextResponse.json(result);
}