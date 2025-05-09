import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";//removed  extractPublicIdFromUrl
import { PrismaClient, Prisma } from "@prisma/client";



// Extend the PrismaClient type to include sellerProfile
interface ExtendedPrismaClient extends PrismaClient {
  sellerProfile: Prisma.SellerProfileDelegate;
}

// Cast the prisma client to the extended type
const extendedPrisma = prisma as unknown as ExtendedPrismaClient;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get the existing seller profile to check for existing documents
    const existingProfile = await extendedPrisma.sellerProfile.findUnique({
      where: { userId },
      select: {
        identityDocument: true,
        businessDocument: true,
        identityDocumentPublicId: true,
        businessDocumentPublicId: true,
        status: true
      },
    });
    
    if (!existingProfile) {
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
      const uploadResult = await uploadToCloudinary(buffer, 'kiva/seller-documents');
      
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
      const uploadResult = await uploadToCloudinary(buffer, 'kiva/seller-documents');
      
      businessDocument = uploadResult.secure_url;
      businessDocumentPublicId = uploadResult.public_id;
    }
    
    // Update the seller profile with the new document URLs and public IDs
    const updatedProfile = await extendedPrisma.sellerProfile.update({
      where: { userId },
      data: {
        identityDocument,
        identityDocumentPublicId,
        businessDocument,
        businessDocumentPublicId,
        // Set status to PENDING if it was previously REJECTED
        ...(existingProfile.status === 'REJECTED' && { status: 'PENDING' }),
      },
    });
    
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
export async function GET() {//removed 
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const sellerProfile = await extendedPrisma.sellerProfile.findUnique({
      where: { userId },
      select: {
        identityDocument: true,
        businessDocument: true,
        status: true,
        isVerified: true,
      },
    });
    
    if (!sellerProfile) {
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
    
    const sellerProfile = await extendedPrisma.sellerProfile.findUnique({
      where: { userId },
      select: {
        identityDocumentPublicId: true,
        businessDocumentPublicId: true,
      },
    });
    
    if (!sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }
    
    // Delete from Cloudinary
    if (documentType === 'identity' && sellerProfile.identityDocumentPublicId) {
      await deleteFromCloudinary(sellerProfile.identityDocumentPublicId);
      
      // Update the seller profile
      await extendedPrisma.sellerProfile.update({
        where: { userId },
        data: {
          identityDocument: null,
          identityDocumentPublicId: null,
        },
      });
    } else if (documentType === 'business' && sellerProfile.businessDocumentPublicId) {
      await deleteFromCloudinary(sellerProfile.businessDocumentPublicId);
      
      // Update the seller profile
      await extendedPrisma.sellerProfile.update({
        where: { userId },
        data: {
          businessDocument: null,
          businessDocumentPublicId: null,
        },
      });
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
