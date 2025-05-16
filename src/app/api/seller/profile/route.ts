import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

// Helper function to extract public ID from Cloudinary URL
function getPublicIdFromUrl(url: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1612447684/kiva/products/sample.jpg
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and seller role
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden. Seller access required." }, { status: 403 });
    }

    const { id: productId } = await params;

    // Check if product exists and belongs to the seller
    const { data: existingProduct, error: findError } = await supabase
      .from("product")
      .select("*")
      .eq("id", productId)
      .single();

    if (findError) throw findError;

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (existingProduct.sellerId !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to update this product" }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const price = parseFloat(formData.get("price") as string);
    const discountPercentage = parseFloat(formData.get("discountPercentage") as string);
    const stock = parseInt(formData.get("stock") as string);

    // Get existing images to keep
    const keepImages = formData.getAll("keepImages") as string[];
    const existingImages = Array.isArray(existingProduct.images)
      ? existingProduct.images
      : typeof existingProduct.images === "string"
        ? JSON.parse(existingProduct.images)
        : [];

    // Find images to delete
    const imagesToDelete = existingImages.filter((url: string) => !keepImages.includes(url));

    // Delete removed images from Cloudinary
    for (const imageUrl of imagesToDelete) {
      const publicId = getPublicIdFromUrl(imageUrl);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
          // Continue with the update even if deletion fails
        }
      }
    }

    // Upload new images
    const imageFiles = formData.getAll("images") as File[];
    const newImageUrls: string[] = [];

    if (imageFiles.length > 0) {
      // Process each image file
      for (const file of imageFiles) {
        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        try {
          const result = await uploadToCloudinary(buffer);
          newImageUrls.push(result.secure_url);
        } catch (error) {
          console.error('Error uploading to Cloudinary:', error);
          throw new Error('Failed to upload image');
        }
      }
    }

    // Combine kept images with new uploads
    const updatedImages = [...keepImages, ...newImageUrls];

    // Ensure there's at least one image
    if (updatedImages.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    }

    // Update product in Supabase
    const { data: updatedProduct, error: updateError } = await supabase
      .from("product")
      .update({
        name,
        description,
        price,
        discountPercentage: discountPercentage || 0,
        stock,
        images: updatedImages,
        categoryId,
      })
      .eq("id", productId)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the product" },
      { status: 500 }
    );
  }
}