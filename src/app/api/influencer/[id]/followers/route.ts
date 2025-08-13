import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use anon key instead of service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const id = pathParts[pathParts.length - 2]; // influencer ID

  try {
    console.log("Counting followers for influencer:", id);
    
    // Count followers from InfluencerFollow table
    const { count, error } = await supabase
      .from("InfluencerFollow")
      .select("id", { count: "exact", head: true })
      .eq("influencerId", id);

    if (error) {
      console.error("Error counting followers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Followers count:", count);
    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Error fetching followers count:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers count" },
      { status: 500 }
    );
  }
}