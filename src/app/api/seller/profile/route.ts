import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  console.log("GET SellerProfile for userId:", userId);


  const { data, error } = await supabase
    .from("SellerProfile")
    .select("*")
    .eq("userId", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") { 
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  console.log("POST SellerProfile for userId:", userId);
  const body = await req.json();

  // Try update first
  const { data, error } = await supabase
    .from("SellerProfile")
    .update({
      businessName: body.businessName,
      businessType: body.businessType,
      description: body.description,
      address: body.address,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
      taxId: body.taxId,
      website: body.website,
      phoneNumber: body.phoneNumber,
      categories: body.categories,
      bannerImage: body.bannerImage,
      logoImage: body.logoImage,
    })
    .eq("userId", userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Update error:", error);
  }

  // If no row was updated, insert
  if (!data) {
    const { data: insertData, error: insertError } = await supabase
      .from("SellerProfile")
      .insert([
        {
          userId,
          businessName: body.businessName,
          businessType: body.businessType,
          description: body.description,
          address: body.address,
          city: body.city,
          state: body.state,
          postalCode: body.postalCode,
          country: body.country,
          taxId: body.taxId,
          website: body.website,
          phoneNumber: body.phoneNumber,
          categories: body.categories,
          bannerImage: body.bannerImage,
          logoImage: body.logoImage,
        },
      ])
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("Insert error:", insertError);
      return Response.json({ error: insertError.message }, { status: 500 });
    }
    return Response.json(insertData);
  }

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export const dynamic = "force-dynamic";