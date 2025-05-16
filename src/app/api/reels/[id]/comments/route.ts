import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get comments for a reel
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: comments, error } = await supabase
      .from("ReelComment")
      .select(
        `
        *,
        user:userId(
          id, name, image, seller_profile: SellerProfile(businessName, logoImage)
        )
      `
      )
      .eq("reelId", id)
      .order("createdAt", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// Add a comment to a reel
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await req.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Check if reel exists
    const { data: reel, error: reelError } = await supabase
      .from("Reel")
      .select("id")
      .eq("id", id)
      .single();

    if (reelError || !reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from("ReelComment")
      .insert([
        {
          content,
          reelId: id,
          userId: session.user.id,
        },
      ])
      .select(
        `
        *,
        user:userId(
          id, name, image, seller_profile: SellerProfile(businessName, logoImage)
        )
      `
      )
      .single();

    if (commentError) {
      throw commentError;
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}