import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { id } = params;
    
    const address = await prisma.address.findUnique({
      where: { id, userId },
    });
    
    if (!address) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { id } = params;
    const data = await req.json();
    
    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id },
    });
    
    if (!existingAddress || existingAddress.userId !== userId) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }
    
    // If this is set as default, unset any existing default
    if (data.isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    
    const address = await prisma.address.update({
      where: { id },
      data: {
        name: data.name,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault,
      },
    });
    
    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { id } = params;
    
    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id },
    });
    
    if (!existingAddress || existingAddress.userId !== userId) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }
    
    await prisma.address.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
