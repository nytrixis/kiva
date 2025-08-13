import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ likes: {} });
    }

    const { reelIds } = await req.json();

    if (!reelIds || !Array.isArray(reelIds)) {
      return NextResponse.json({ error: "Invalid reel IDs" }, { status: 400 });
    }

    const { data: likes, error } = await supabase
      .from("ReelLike")
      .select("reelId")
      .eq("userId", session.user.id)
      .in("reelId", reelIds);

    if (error) {
      console.error("Error fetching like statuses:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert to object format { reelId: true }
    const likesMap = likes.reduce((acc, like) => {
      acc[like.reelId] = true;
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json({ likes: likesMap });
  } catch (error) {
    console.error("Error checking like statuses:", error);
    return NextResponse.json(
      { error: "Failed to check like statuses" },
      { status: 500 }
    );
  }
}