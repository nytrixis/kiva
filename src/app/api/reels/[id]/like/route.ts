import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Extract reelId from the URL
  const { pathname } = req.nextUrl;
  const match = pathname.match(/\/reels\/([^/]+)\/like/);
  const reelId = match ? match[1] : null;
  if (!reelId) {
    return NextResponse.json({ error: "Invalid reel id" }, { status: 400 });
  }

  // Get the `liked` parameter from request body
  const body = await req.json().catch(() => ({}));
  const { liked } = body;

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("ReelLike")
    .select("id")
    .eq("reelId", reelId)
    .eq("userId", userId)
    .maybeSingle();

  let finalLiked: boolean;

  if (typeof liked === 'boolean') {
    // Use the provided liked state
    if (liked && !existingLike) {
      // Add like
      await supabase.from("ReelLike").insert([{ reelId, userId }]);
      finalLiked = true;
    } else if (!liked && existingLike) {
      // Remove like
      await supabase.from("ReelLike").delete().eq("id", existingLike.id);
      finalLiked = false;
    } else {
      // No change needed
      finalLiked = !!existingLike;
    }
  } else {
    // Toggle behavior (fallback)
    if (existingLike) {
      await supabase.from("ReelLike").delete().eq("id", existingLike.id);
      finalLiked = false;
    } else {
      await supabase.from("ReelLike").insert([{ reelId, userId }]);
      finalLiked = true;
    }
  }

  // Get new like count
  const { count } = await supabase
    .from("ReelLike")
    .select("*", { count: "exact", head: true })
    .eq("reelId", reelId);

  return NextResponse.json({
    liked: finalLiked,
    likeCount: count ?? 0,
  });
}