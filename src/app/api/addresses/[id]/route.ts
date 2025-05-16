import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { data: address, error } = await supabase
      .from("address")
      .select("*")
      .eq("id", id)
      .eq("userId", userId)
      .single();

    if (error || !address) {
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();

    // Check if address exists and belongs to user
    const { data: existingAddress } = await supabase
      .from("address")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingAddress || existingAddress.userId !== userId) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // If this is set as default, unset any existing default
    if (data.isDefault && !existingAddress.isDefault) {
      const { error: updateError } = await supabase
        .from("address")
        .update({ isDefault: false })
        .eq("userId", userId)
        .eq("isDefault", true);
      if (updateError) {
        throw updateError;
      }
    }

    const { data: address, error: updateAddressError } = await supabase
      .from("address")
      .update({
        name: data.name,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault,
      })
      .eq("id", id)
      .eq("userId", userId)
      .select()
      .single();

    if (updateAddressError) {
      throw updateAddressError;
    }

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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if address exists and belongs to user
    const { data: existingAddress } = await supabase
      .from("address")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingAddress || existingAddress.userId !== userId) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("address")
      .delete()
      .eq("id", id)
      .eq("userId", userId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}