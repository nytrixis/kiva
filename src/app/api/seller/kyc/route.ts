import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get the existing seller profile to check for existing documents
    const { data: existingProfile, error: profileError } = await supabase
      .from("seller_profile")
      .select(
        "identityDocument, businessDocument, identityDocumentPublicId, businessDocumentPublicId, status"
      )
      .eq("userId", userId)
      .single();

    if (profileError || !existingProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    // Parse the form data to get the files
    const formData = await req.formData();

    // Handle identity document upload
    const identityDocumentFile = formData.get('identityDocument') as File | null;
    let identityDocument = existingProfile.identityDocument;
    let identityDocumentPublicId = existingProfile.identityDocumentPublicId;

    if (identityDocumentFile) {
      // Delete existing document if it exists
      if (existingProfile.identityDocumentPublicId) {
        await deleteFromCloudinary(existingProfile.identityDocumentPublicId);
      }

      // Convert File to Buffer for Cloudinary upload
      const arrayBuffer = await identityDocumentFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(buffer, 'image');

      identityDocument = uploadResult.secure_url;
      identityDocumentPublicId = uploadResult.public_id;
    }

    // Handle business document upload
    const businessDocumentFile = formData.get('businessDocument') as File | null;
    let businessDocument = existingProfile.businessDocument;
    let businessDocumentPublicId = existingProfile.businessDocumentPublicId;

    if (businessDocumentFile) {
      // Delete existing document if it exists
      if (existingProfile.businessDocumentPublicId) {
        await deleteFromCloudinary(existingProfile.businessDocumentPublicId);
      }

      // Convert File to Buffer for Cloudinary upload
      const arrayBuffer = await businessDocumentFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(buffer, 'image');

      businessDocument = uploadResult.secure_url;
      businessDocumentPublicId = uploadResult.public_id;
    }

    // Update the seller profile with the new document URLs and public IDs
    const { data: updatedProfile, error: updateError } = await supabase
      .from("seller_profile")
      .update({
        identityDocument,
        identityDocumentPublicId,
        businessDocument,
        businessDocumentPublicId,
        ...(existingProfile.status === 'REJECTED' && { status: 'PENDING' }),
      })
      .eq("userId", userId)
      .select("identityDocument, businessDocument, status")
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: {
        identityDocument: updatedProfile.identityDocument,
        businessDocument: updatedProfile.businessDocument,
        status: updatedProfile.status
      }
    });
  } catch (error) {
    console.error("Error updating KYC documents:", error);
    return NextResponse.json(
      { error: "Failed to update KYC documents" },
      { status: 500 }
    );
  }
}

// API route to get the current KYC documents
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { data: sellerProfile, error } = await supabase
      .from("seller_profile")
      .select("identityDocument, businessDocument, status, isVerified")
      .eq("userId", userId)
      .single();

    if (error || !sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: sellerProfile });
  } catch (error) {
    console.error("Error fetching KYC documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC documents" },
      { status: 500 }
    );
  }
}

// API route to delete a KYC document
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const documentType = searchParams.get('type');

    if (!documentType || !['identity', 'business'].includes(documentType)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    const { data: sellerProfile, error } = await supabase
      .from("seller_profile")
      .select("identityDocumentPublicId, businessDocumentPublicId")
      .eq("userId", userId)
      .single();

    if (error || !sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    // Delete from Cloudinary and update Supabase
    if (documentType === 'identity' && sellerProfile.identityDocumentPublicId) {
      await deleteFromCloudinary(sellerProfile.identityDocumentPublicId);

      await supabase
        .from("seller_profile")
        .update({
          identityDocument: null,
          identityDocumentPublicId: null,
        })
        .eq("userId", userId);
    } else if (documentType === 'business' && sellerProfile.businessDocumentPublicId) {
      await deleteFromCloudinary(sellerProfile.businessDocumentPublicId);

      await supabase
        .from("seller_profile")
        .update({
          businessDocument: null,
          businessDocumentPublicId: null,
        })
        .eq("userId", userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting KYC document:", error);
    return NextResponse.json(
      { error: "Failed to delete KYC document" },
      { status: 500 }
    );
  }
}