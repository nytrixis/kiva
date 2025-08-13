import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const id = pathParts[pathParts.length - 1];

  try {
    // 1. First try to find by profile ID, then by user ID
    let { data: profile, error: profileError } = await supabase
      .from("InfluencerProfile")
      .select(`
        *,
        user:userid (
          id,
          name,
          email,
          image,
          createdAt
        )
      `)
      .eq("id", id)
      .single();

    // If not found by profile ID, try by user ID
    if (profileError || !profile) {
      const { data: profileByUserId, error: userIdError } = await supabase
        .from("InfluencerProfile")
        .select(`
          *,
          user:userid (
            id,
            name,
            email,
            image,
            createdAt
          )
        `)
        .eq("userid", id)
        .single();

      if (userIdError || !profileByUserId) {
        return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
      }

      profile = profileByUserId;
      profileError = userIdError;
    }

    // 2. Fetch influencer's reels using the correct userId
    const { data: reels, error: reelsError } = await supabase
      .from("Reel")
      .select(`
        id,
        videoUrl,
        thumbnailUrl,
        caption,
        createdAt,
        product:productId (
          id,
          name,
          price,
          images,
          discountPercentage
        )
      `)
      .eq("userId", profile.userid) // Use profile.userid to match with Reel.userId
      .order("createdAt", { ascending: false });

    if (reelsError) {
      console.error("Error fetching reels:", reelsError);
    }

    // 3. Get reels engagement data
    const reelIds = reels?.map(r => r.id) || [];
    let likesMap: Record<string, number> = {};
    let commentsMap: Record<string, number> = {};

    if (reelIds.length > 0) {
      // Get likes count for each reel
      const { data: likes } = await supabase
        .from("ReelLike")
        .select("reelId")
        .in("reelId", reelIds);

      // Get comments count for each reel
      const { data: comments } = await supabase
        .from("ReelComment")
        .select("reelId")
        .in("reelId", reelIds);

      // Group by reelId
      likesMap = (likes || []).reduce((acc, like) => {
        acc[like.reelId] = (acc[like.reelId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      commentsMap = (comments || []).reduce((acc, comment) => {
        acc[comment.reelId] = (acc[comment.reelId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }

    // 4. Transform reels with engagement data
    const transformedReels = (reels || []).map(reel => ({
      ...reel,
      likeCount: likesMap[reel.id] || 0,
      commentCount: commentsMap[reel.id] || 0,
    }));

    // 5. Calculate stats
    const stats = {
      totalReels: transformedReels.length,
      totalLikes: Object.values(likesMap).reduce((sum, count) => sum + count, 0),
      totalComments: Object.values(commentsMap).reduce((sum, count) => sum + count, 0),
      followers: profile.followerscount || 0,
    };

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.user?.name,
        bio: profile.bio,
        image: profile.image || profile.user?.image,
        platform: profile.platform,
        profileLink: profile.profilelink,
        followersCount: profile.followerscount,
        status: profile.status,
        createdAt: profile.user?.createdAt,
        stats,
      },
      reels: transformedReels,
    });
  } catch (error) {
    console.error("Error fetching influencer profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch influencer profile" },
      { status: 500 }
    );
  }
}