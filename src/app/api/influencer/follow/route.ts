import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Use anon key instead of service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { influencerId } = await req.json();

    if (!influencerId) {
      return NextResponse.json({ error: "Influencer ID required" }, { status: 400 });
    }

    console.log("Follow action for user:", session.user.id, "influencer:", influencerId);

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from("InfluencerFollow")
      .select("id")
      .eq("followerId", session.user.id)
      .eq("influencerId", influencerId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking follow status:", checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingFollow) {
      // Unfollow
      console.log("Unfollowing...");
      const { error: unfollowError } = await supabase
        .from("InfluencerFollow")
        .delete()
        .eq("id", existingFollow.id);

      if (unfollowError) {
        console.error("Error unfollowing:", unfollowError);
        return NextResponse.json({ error: unfollowError.message }, { status: 500 });
      }

      return NextResponse.json({ following: false });
    } else {
      // Follow
      console.log("Following...");
      const { error: followError } = await supabase
        .from("InfluencerFollow")
        .insert([{
          followerId: session.user.id,
          influencerId: influencerId,
          createdAt: new Date().toISOString()
        }]);

      if (followError) {
        console.error("Error following:", followError);
        return NextResponse.json({ error: followError.message }, { status: 500 });
      }

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ following: false });
    }

    const { searchParams } = new URL(req.url);
    const influencerId = searchParams.get("influencerId");

    if (!influencerId) {
      return NextResponse.json({ error: "Influencer ID required" }, { status: 400 });
    }

    console.log("Checking follow status for user:", session.user.id, "influencer:", influencerId);

    // Check if following
    const { data: follow, error } = await supabase
      .from("InfluencerFollow")
      .select("id")
      .eq("followerId", session.user.id)
      .eq("influencerId", influencerId)
      .maybeSingle();

    if (error) {
      console.error("Error checking follow status:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Follow status:", !!follow);
    return NextResponse.json({ following: !!follow });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: "Failed to check follow status" },
      { status: 500 }
    );
  }
}