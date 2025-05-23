import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Extract reelId from the URL
  const { pathname } = req.nextUrl;
  const match = pathname.match(/\/reels\/([^/]+)\/engagement/);
  const reelId = match ? match[1] : null;
  if (!reelId) {
    return NextResponse.json({ error: "Invalid reel id" }, { status: 400 });
  }

  // Likes
  const { data: likes, error: likesError } = await supabase
    .from("ReelLike")
    .select("id, userId")
    .eq("reelId", reelId);

  // Comments
  const { data: comments, error: commentsError } = await supabase
    .from("ReelComment")
    .select(`
      id,
      content,
      createdAt,
      user: userId (
        id,
        name,
        image
      )
    `)
    .eq("reelId", reelId)
    .order("createdAt", { ascending: false });

  console.log("Session userId:", userId);
  console.log("Likes:", likes);

  if (likesError || commentsError) {
    return NextResponse.json({ error: "Failed to fetch engagement" }, { status: 500 });
  }

  const isLiked = !!likes?.find(like => like.userId === userId);
  console.log("isLiked:", isLiked);
  return NextResponse.json({
    likeCount: likes?.length ?? 0,
    isLiked,
    comments: comments ?? [],
    commentCount: comments?.length ?? 0,
  });
}