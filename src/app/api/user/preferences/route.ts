import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user preferences
    const { data: userPreferences, error } = await supabase
      .from("user_preference")
      .select("*")
      .eq("userId", session.user.id)
      .single();

    // If no preferences exist yet, return empty defaults
    if (error || !userPreferences) {
      return NextResponse.json({
        preferences: {
          categories: [],
          notifications: true,
          location: "",
        }
      });
    }

    return NextResponse.json({ preferences: userPreferences });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user preferences" },
      { status: 500 }
    );
  }
}