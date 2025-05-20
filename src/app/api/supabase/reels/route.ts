import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const take = Number(req.nextUrl.searchParams.get("take")) || 5;

  // 1. Fetch reels with related user and product
  const { data: reels, error } = await supabase
    .from("Reel")
    .select(`
      *,
      user:userId (
        id,
        name,
        image,
        sellerProfile:SellerProfile (
          businessName,
          logoImage
        )
      ),
      product:productId (
        id,
        name,
        price,
        images,
        discountPercentage
      )
    `)
    .order("createdAt", { ascending: false })
    .limit(take);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reelIds = (reels || []).map(r => r.id);

  // 2. Fetch likes for these reels
  let likesByReel: Record<string, { userId: string }[]> = {};
  if (reelIds.length > 0) {
    const { data: likes } = await supabase
      .from("ReelLike")
      .select("reelId, userId")
      .in("reelId", reelIds);

    // Group likes by reelId
    likesByReel = (likes || []).reduce((acc, like) => {
      if (!acc[like.reelId]) acc[like.reelId] = [];
      acc[like.reelId].push({ userId: like.userId });
      return acc;
    }, {} as Record<string, { userId: string }[]>);
  }

  // 3. Merge likes info into each reel
  const reelsWithLikes = (reels || []).map(reel => {
    let sellerProfile = reel.user?.sellerProfile;
  if (Array.isArray(sellerProfile)) {
    sellerProfile = sellerProfile[0] || null;
  }
  return {
    ...reel,
    user: {
      ...reel.user,
      sellerProfile,
    },
    likeCount: likesByReel[reel.id]?.length || 0,
    isLiked: !!userId && (likesByReel[reel.id] || []).some(like => like.userId === userId),
  };
});

  return NextResponse.json(reelsWithLikes);
}