import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
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

  // 4. Fetch seller profiles
  const userIds = [...new Set((reels ?? []).map(reel => reel.user?.id).filter(Boolean))];
  const sellerProfiles: Record<string, { businessName: string; logoImage: string | null; id: string }> = {};
  const influencerProfiles: Record<string, { id: string; platform: string; image: string | null }> = {};

  if (userIds.length > 0) {
    // Fetch seller profiles
    const { data: sellerProfileData } = await supabase
      .from("SellerProfile")
      .select("userId, businessName, logoImage, id")
      .in("userId", userIds);
    
    if (sellerProfileData) {
      for (const profile of sellerProfileData) {
        sellerProfiles[profile.userId] = {
          businessName: profile.businessName,
          logoImage: profile.logoImage,
          id: profile.id,
        };
      }
    }

    // Fetch influencer profiles
    const { data: influencerProfileData } = await supabase
      .from("InfluencerProfile")
      .select("userid, id, platform, image")
      .in("userid", userIds);
    
    if (influencerProfileData) {
      for (const profile of influencerProfileData) {
        influencerProfiles[profile.userid] = {
          id: profile.id,
          platform: profile.platform,
          image: profile.image,
        };
      }
    }
  }

  const reelsWithEngagement = (reels ?? []).map(reel => {
    return {
      ...reel,
      user: reel.user
        ? {
            ...reel.user,
            sellerProfile: sellerProfiles[reel.user.id] || null,
            influencerProfile: influencerProfiles[reel.user.id] || null,
          }
        : null,
      likeCount: (likes?.filter(l => l.reelId === reel.id) ?? []).length,
      commentCount: (comments?.filter(c => c.reelId === reel.id) ?? []).length,
      isLiked: !!likes?.find(l => l.reelId === reel.id && l.userId === userId),
    };
  });

  return NextResponse.json({ reels: reelsWithEngagement });
}