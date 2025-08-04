import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { data: profile, error } = await supabase
    .from("InfluencerProfile")
    .select("*,user:User(*)")
    .eq("userid", userId)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const data = await req.json();

  // Only update columns that exist in InfluencerProfile
  const updateData = {
    platform: data.platform,
    profilelink: data.profileLink,
    followerscount: data.followerscount !== undefined && data.followerscount !== null
    ? Number(data.followerscount)
    : 0, 
    bankaccountname: data.bankAccountName,
    bankaccountnumber: data.bankAccountNumber,
    ifsccode: data.ifscCode,
    bankname: data.bankName,
    bankbranch: data.bankBranch,
    panortaxid: data.panOrTaxId,
    kycdocument: data.kycDocument,
    address: data.address,
    status: data.status,
    secondaryplatform: data.secondaryPlatform,
    secondaryprofilelink: data.secondaryProfileLink,
    upiid: data.upiId,
    bio: data.bio,
    image: data.image,
    updatedat: new Date().toISOString(),
  };

  // Remove undefined fields so only provided fields are updated
  (Object.keys(updateData) as Array<keyof typeof updateData>).forEach(
    (key) => updateData[key] === undefined && delete updateData[key]
  );

  const { error } = await supabase
    .from("InfluencerProfile")
    .update(updateData)
    .eq("userid", userId);

  if (error) {
  console.error("Supabase update error:", error); // <-- See the real error
  return NextResponse.json({ error: error.message }, { status: 500 });
}
  return NextResponse.json({ success: true });
}