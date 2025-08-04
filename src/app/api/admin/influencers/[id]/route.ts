import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
  INFLUENCER = "INFLUENCER",
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: influencer, error } = await supabase
    .from("InfluencerProfile")
    .select("*, user:User(*)")
    .eq("userid", id)
    .single();

  if (error || !influencer) {
    return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: influencer });
}