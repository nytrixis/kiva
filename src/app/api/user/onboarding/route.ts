import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { preferences } = await req.json();

    // Validate input
    if (!preferences) {
      return NextResponse.json(
        { error: "Missing preferences data" },
        { status: 400 }
      );
    }

    // Update user with onboarding information
    const { data: updatedUser, error: userError } = await supabase
      .from("User")
      .update({
        isOnboarded: true,
        location: preferences.location || null,
      })
      .eq("id", session.user.id)
      .select("*")
      .single();

    if (userError) throw userError;

    // Upsert user preferences
    const { data: userPreferences, error: prefError } = await supabase
      .from("UserPreference")
      .upsert([
        {
          userId: session.user.id,
          categories: preferences.categories || [],
          notifications: preferences.notifications ?? true,
          // Add other preference fields as needed
        }
      ], { onConflict: "userId" })
      .select("*")
      .single();

    if (prefError) throw prefError;

    // Remove sensitive data if needed
    const { ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        preferences: userPreferences,
        message: "Onboarding completed successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "An error occurred during onboarding" },
      { status: 500 }
    );
  }
}