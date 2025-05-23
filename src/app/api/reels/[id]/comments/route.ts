import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = pathname.match(/\/reels\/([^/]+)\/comments/);
  const reelId = match ? match[1] : null;
  if (!reelId) {
    return NextResponse.json({ error: "Invalid reel id" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { content } = await req.json();

  const { data: comment, error } = await supabase
    .from("ReelComment")
    .insert([{ reelId, userId, content }])
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
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }

  return NextResponse.json({ comment });
}

export async function GET(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = pathname.match(/\/reels\/([^/]+)\/comments/);
  const reelId = match ? match[1] : null;
  if (!reelId) {
    return NextResponse.json({ error: "Invalid reel id" }, { status: 400 });
  }

  const { data: comments, error } = await supabase
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

  if (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }

  return NextResponse.json({ comments });
}