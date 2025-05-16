import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = req.nextUrl.searchParams.get("userId") || session.user.id;

    // 1. Fetch the reel
    const { data: reel, error: reelError } = await supabase
      .from("Reel")
      .select(
        `
        *,
        user:userId (
          id, name, image
        ),
        product:productId (
          id, name, price, images, discountPercentage, categoryId
        )
        `
      )
      .eq("id", id)
      .single();

    if (reelError || !reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    // 2. Fetch likes for this reel
    const { data: likes } = await supabase
      .from("ReelLike")
      .select("id, userId")
      .eq("reelId", id);

    // 3. Fetch comments for this reel
    const { data: comments } = await supabase
      .from("ReelComment")
      .select("id")
      .eq("reelId", id);

    // 4. Fetch seller profile
    let sellerProfile = null;
    if (reel.user?.id) {
      const { data: profile } = await supabase
        .from("SellerProfile")
        .select("userId, businessName, logoImage")
        .eq("userId", reel.user.id)
        .single();
      sellerProfile = profile || null;
    }

    // 5. Merge everything
    const likeCount = likes?.length || 0;
    const commentCount = comments?.length || 0;

    const transformedReel = {
      ...reel,
      user: reel.user
        ? {
            ...reel.user,
            sellerProfile,
          }
        : null,
      isLiked: (likes || []).some((like: any) => like.userId === userId),
      _count: {
        likes: likeCount,
        comments: commentCount,
      },
      // Optionally, you can remove likes/comments arrays if not needed
    };

    return NextResponse.json(transformedReel);
  } catch (error) {
    console.error("Error fetching reel:", error);
    return NextResponse.json(
      { error: "Failed to fetch reel" },
      { status: 500 }
    );
  }
}