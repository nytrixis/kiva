import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

interface SellerProfile {
  id: string;
  businessName: string;
  businessType: string;
  status: string;
  identityDocument: string | null;
  businessDocument: string | null;
  logoImage: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  phoneNumber: string | null;
  website: string | null;
  description: string | null;
  categories: string[] | null;
  taxId: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  verifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserWithSellerProfile {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  sellerProfile: SellerProfile[];
}

enum UserRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  CUSTOMER = "CUSTOMER",
  INFLUENCER = "INFLUENCER",
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;

    // ✅ FIXED: Start from User table and filter by role first, then join SellerProfile
    const query = supabase
      .from("User")
      .select(`
        *,
        sellerProfile:SellerProfile(*)
      `)
      .eq("role", UserRole.SELLER);

    const { data: users, error } = await query;

    if (error) {
      throw error;
    }

    // ✅ Transform the data to match expected format and filter by status if needed
    const sellers = (users as UserWithSellerProfile[])
      .filter((user: UserWithSellerProfile) => {
        // Only include users who have a seller profile
        const hasSellerProfile = user.sellerProfile && user.sellerProfile.length > 0;
        if (!hasSellerProfile) return false;


        // Filter by status if specified
        if (status) {
          const sellerProfile = user.sellerProfile[0];
          return sellerProfile.status === status;
        }
        return true;
      })
      .map((user: UserWithSellerProfile) => ({
        id: user.sellerProfile[0].id,
        businessName: user.sellerProfile[0].businessName,
        businessType: user.sellerProfile[0].businessType,
        status: user.sellerProfile[0].status,
        identityDocument: user.sellerProfile[0].identityDocument,
        businessDocument: user.sellerProfile[0].businessDocument,
        logoImage: user.sellerProfile[0].logoImage,
        address: user.sellerProfile[0].address,
        city: user.sellerProfile[0].city,
        state: user.sellerProfile[0].state,
        country: user.sellerProfile[0].country,
        postalCode: user.sellerProfile[0].postalCode,
        phoneNumber: user.sellerProfile[0].phoneNumber,
        website: user.sellerProfile[0].website,
        description: user.sellerProfile[0].description,
        categories: user.sellerProfile[0].categories,
        taxId: user.sellerProfile[0].taxId,
        isVerified: user.sellerProfile[0].isVerified,
        verifiedAt: user.sellerProfile[0].verifiedAt,
        verifiedBy: user.sellerProfile[0].verifiedBy,
        createdAt: user.sellerProfile[0].createdAt,
        updatedAt: user.sellerProfile[0].updatedAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      }));

    return NextResponse.json({ success: true, data: sellers });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return NextResponse.json(
      { error: "Failed to fetch sellers" },
      { status: 500 }
    );
  }
}