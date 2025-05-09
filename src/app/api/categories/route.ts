import { NextResponse } from "next/server";//removed NextRequest
import { prisma } from "@/lib/db";

export async function GET() {//removed req: NextRequest
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      categories 
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
