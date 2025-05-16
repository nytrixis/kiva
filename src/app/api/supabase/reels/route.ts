import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Like {
  id: string;
  userId: string;
}

interface Reel {
  id: string;
  likes?: Like[];
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const take = Number(req.nextUrl.searchParams.get("take")) || 5;

  // Fetch reels with related user, product, and like/comment counts
  const { data: reels, error } = await supabase
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
        discountPercentage
      ),
      likes:user_id (
        id
      ),
      _count:reels (
        likes,
        comments
      )
    `)
    .order("createdAt", { ascending: false })
    .limit(take);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optionally, filter likes for the current user
  const reelsWithLikes = (reels || []).map((reel: Reel) => ({
    ...reel,
    likes: reel.likes?.filter((like: Like) => like.id === userId) || [],
  }));

  return NextResponse.json(reelsWithLikes);
}