import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userid = session.user.id;
  const data = await req.json();

  // Insert influencer profile
  const { error } = await supabase.from("InfluencerProfile").insert([
    {
      userid,
      platform: data.platform,
      profilelink: data.profilelink,
      followerscount: Number(data.followerscount),
      secondaryplatform: data.secondaryplatform,
      secondaryprofilelink: data.secondaryprofilelink,
      bankaccountname: data.bankaccountname,
      bankaccountnumber: data.bankaccountnumber,
      ifsccode: data.ifsccode,
      bankname: data.bankname,
      bankbranch: data.bankbranch,
      upiid: data.upiid,
      panortaxid: data.panortaxid,
      kycdocument: data.kycdocument,
      address: data.address,
      bio: data.bio,
      status: "PENDING",
    },
  ]);

  // Mark user as onboarded
  await supabase.from("User").update({ isOnboarded: true }).eq("id", userid);



  if (error) {
  console.error("Supabase insert error:", error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
  return NextResponse.json({ success: true });
}