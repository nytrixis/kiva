import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
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
    const userPreferences = await prisma.userPreference.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    
    // If no preferences exist yet, return empty defaults
    if (!userPreferences) {
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
