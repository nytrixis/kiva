import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    
    const { preferences, role } = await req.json();
    
    // Validate input
    if (!preferences) {
      return NextResponse.json(
        { error: "Missing preferences data" },
        { status: 400 }
      );
    }
    
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update user with onboarding information
      const updatedUser = await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          isOnboarded: true,
          location: preferences.location || null,
        },
      });
      
      // Create user preferences record
      // This is a better approach than storing JSON in a bio field
      const userPreferences = await tx.userPreference.upsert({
        where: {
          userId: session.user.id,
        },
        update: {
          categories: preferences.categories || [],
          notifications: preferences.notifications ?? true,
          // Add other preference fields as needed
        },
        create: {
          userId: session.user.id,
          categories: preferences.categories || [],
          notifications: preferences.notifications ?? true,
          // Add other preference fields as needed
        },
      });
      
      return { updatedUser, userPreferences };
    });
    
    // Remove sensitive data
    const { password, ...userWithoutPassword } = result.updatedUser;
    
    return NextResponse.json(
      { 
        user: userWithoutPassword,
        preferences: result.userPreferences,
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
