import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  // Extract userId from the URL path
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const userId = pathParts[pathParts.length - 1]; // last part is [userId]

  const { data, error } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json(null, { status: 404 });
  }
  return NextResponse.json(data);
}