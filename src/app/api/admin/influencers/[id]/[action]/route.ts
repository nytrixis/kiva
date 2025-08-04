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
enum InfluencerStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action } = await params;

    // Find influencer profile by userid
    const { data: influencerProfile, error: fetchError } = await supabase
      .from("InfluencerProfile")
      .select("*")
      .eq("userid", id)
      .single();

    if (fetchError || !influencerProfile) {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
    }

    let status: InfluencerStatus = InfluencerStatus.PENDING;
    if (action === "approve") status = InfluencerStatus.APPROVED;
    else if (action === "reject") status = InfluencerStatus.REJECTED;
    else if (action === "suspend") status = InfluencerStatus.SUSPENDED;
    else if (action === "reset") status = InfluencerStatus.PENDING;
    else return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const { data: updatedProfile, error: updateError } = await supabase
      .from("InfluencerProfile")
      .update({
        status,
        updatedat: new Date().toISOString(),
      })
      .eq("id", influencerProfile.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error("Error updating influencer status:", error);
    return NextResponse.json(
      { error: "Failed to update influencer status" },
      { status: 500 }
    );
  }
}