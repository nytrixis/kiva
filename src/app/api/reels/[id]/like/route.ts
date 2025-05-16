import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if reel exists
    const { data: reel, error: reelError } = await supabase
      .from("Reel")
      .select("id")
      .eq("id", id)
      .single();

    if (reelError || !reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    // Check if user already liked the reel
    const { data: existingLike, error: likeError } = await supabase
      .from("ReelLike")
      .select("id")
      .eq("reelId", id)
      .eq("userId", session.user.id)
      .maybeSingle();

    if (likeError) {
      throw likeError;
    }

if (existingLike) {
  // Unlike
  const { error: deleteError } = await supabase
    .from("ReelLike")
    .delete()
    .eq("id", existingLike.id);

  if (deleteError) {
    throw deleteError;
  }

  // Get the new like count after unliking
  const { count: newCount, error: countError } = await supabase
    .from("ReelLike")
    .select("*", { count: "exact", head: true })
    .eq("reelId", id);

  if (countError) {
    throw countError;
  }

  return NextResponse.json({ liked: false, likeCount: newCount });
} else {
  // Like
  const { error: createError } = await supabase
    .from("ReelLike")
    .insert([
      {
        reelId: id,
        userId: session.user.id,
      },
    ]);

  if (createError) {
    throw createError;
  }

  // Get the new like count after liking
  const { count: newCount, error: countError } = await supabase
    .from("ReelLike")
    .select("*", { count: "exact", head: true })
    .eq("reelId", id);

  if (countError) {
    throw countError;
  }

  return NextResponse.json({ liked: true, likeCount: newCount });
}
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}