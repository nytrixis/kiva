import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // <-- FIXED
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  let userId = searchParams.get("userId");
  if (!userId) {
    // Pass as named params for App Router
    const session = await getServerSession(authOptions);
    userId = session?.user?.id ?? null;
  }

  // 1. Fetch reels
  const { data: reels, error } = await supabase
    .from("Reel")
    .select(`
      *,
      user:userId (
        id, name, image
      ),
      product:productId (
        id, name, price, images, discountPercentage
      )
    `)
    .order("createdAt", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch reels" }, { status: 500 });
  }

  const reelIds = reels?.map(r => r.id) ?? [];

  // 2. Likes
  const { data: likes } = await supabase
    .from("ReelLike")
    .select("id, userId, reelId")
    .in("reelId", reelIds);

  // 3. Comments
  const { data: comments } = await supabase
    .from("ReelComment")
    .select("id, reelId")
    .in("reelId", reelIds);

  // After fetching reels, add this:
const userIds = [...new Set((reels ?? []).map(reel => reel.user?.id).filter(Boolean))];
let sellerProfiles: Record<string, { businessName: string; logoImage: string | null; id: string }> = {};
if (userIds.length > 0) {
  const { data: profiles } = await supabase
    .from("SellerProfile")
    .select("userId, businessName, logoImage, id")
    .in("userId", userIds);
  if (profiles) {
    for (const profile of profiles) {
      sellerProfiles[profile.userId] = {
        businessName: profile.businessName,
        logoImage: profile.logoImage,
        id: profile.id,
      };
    }
  }
}

const reelsWithEngagement = (reels ?? []).map(reel => {
  // Merge sellerProfile into user
  return {
    ...reel,
    user: reel.user
      ? {
          ...reel.user,
          sellerProfile: sellerProfiles[reel.user.id] || null,
        }
      : null,
    // ...rest of your engagement logic
    likeCount: (likes?.filter(l => l.reelId === reel.id) ?? []).length,
    commentCount: (comments?.filter(c => c.reelId === reel.id) ?? []).length,
    isLiked: !!likes?.find(l => l.reelId === reel.id && l.userId === userId),
  };
});

  return NextResponse.json({ reels: reelsWithEngagement });
}