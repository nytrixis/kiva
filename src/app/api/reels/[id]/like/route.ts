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

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("ReelLike")
    .select("id")
    .eq("reelId", reelId)
    .eq("userId", userId)
    .maybeSingle();

  if (existingLike) {
    // Unlike
    await supabase.from("ReelLike").delete().eq("id", existingLike.id);
  } else {
    // Like
    await supabase.from("ReelLike").insert([{ reelId, userId }]);
  }

  // Get new like count
  const { count } = await supabase
    .from("ReelLike")
    .select("*", { count: "exact", head: true })
    .eq("reelId", reelId);

  return NextResponse.json({
    liked: !existingLike,
    likeCount: count ?? 0,
  });
}